"""Unit tests for schema dump comparison."""

from __future__ import annotations

import unittest

from db_scripts.schema_sync import (
    SchemaMismatch,
    assert_schemas_match,
    diff_schemas,
    format_schema_mismatch_report,
)


class DiffSchemasTests(unittest.TestCase):
    def test_diff_schemas_reports_when_a_column_exists_only_on_the_target(self) -> None:
        # Given matching dumps except one extra column on the target
        source = "\n".join(
            [
                "members|id|uuid|uuid",
                "members|email|text|text",
            ]
        )
        target = "\n".join(
            [
                "members|email|text|text",
                "members|id|uuid|uuid",
                "members|nickname|text|text",
            ]
        )

        # When
        diff = diff_schemas(source, target)

        # Then
        self.assertFalse(diff.schemas_match)
        self.assertEqual(diff.only_on_source, ())
        self.assertEqual(diff.only_on_target, ("members|nickname|text|text",))

    def test_diff_schemas_ignores_line_order_when_sets_match(self) -> None:
        # Given the same columns in different order
        source = "members|b|text|text\nmembers|a|uuid|uuid\n"
        target = "members|a|uuid|uuid\nmembers|b|text|text\n"

        # When
        diff = diff_schemas(source, target)

        # Then
        self.assertTrue(diff.schemas_match)

    def test_assert_schemas_match_raises_SchemaMismatch_with_a_readable_report(
        self,
    ) -> None:
        # Given a column only on SOURCE
        source = "members|id|uuid|uuid\nmembers|legacy|text|text\n"
        target = "members|id|uuid|uuid\n"

        # When / Then
        with self.assertRaises(SchemaMismatch) as ctx:
            assert_schemas_match(source, target)

        report = ctx.exception.report
        self.assertIn("SOURCE: members|legacy|text|text", report)
        self.assertIn("Run pending migrations on the TARGET", report)
        self.assertEqual(format_schema_mismatch_report(diff_schemas(source, target)), report)


if __name__ == "__main__":
    unittest.main()
