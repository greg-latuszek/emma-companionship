"""Unit tests for the exported tables catalog."""

from __future__ import annotations

import unittest

from db_scripts.exported_tables import (
    EXPORTED_TABLES,
    pg_dump_table_flags,
    schema_columns_query,
    tables_sql_in,
    tables_truncate_list,
)


class ExportedTablesTests(unittest.TestCase):
    def test_tables_truncate_list_lists_child_tables_before_parents(self) -> None:
        # Given the canonical export table order
        # When
        truncate_list = tables_truncate_list()

        # Then — companionship_relations (child) before members (parent)
        self.assertEqual(
            truncate_list,
            "companionship_relations, members",
        )
        self.assertEqual(EXPORTED_TABLES[0], "companionship_relations")
        self.assertEqual(EXPORTED_TABLES[1], "members")

    def test_pg_dump_table_flags_emits_minus_t_for_each_exported_table(self) -> None:
        # Given / When
        flags = pg_dump_table_flags()

        # Then
        self.assertEqual(
            flags,
            ["-t", "companionship_relations", "-t", "members"],
        )

    def test_tables_sql_in_quotes_each_table_name_for_SQL(self) -> None:
        # Given / When / Then
        self.assertEqual(
            tables_sql_in(),
            "'companionship_relations','members'",
        )

    def test_schema_columns_query_filters_to_exported_tables(self) -> None:
        # Given / When
        sql = schema_columns_query()

        # Then
        self.assertIn("information_schema.columns", sql)
        self.assertIn("'companionship_relations','members'", sql)
        self.assertIn("ORDER BY table_name, column_name", sql)


if __name__ == "__main__":
    unittest.main()
