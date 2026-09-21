export type CommunityMemberFormValues = {
  first_name: string;
  last_name: string;
  gender: string;
  marital_status: string;
  consecrated_status: string;
  community_engagement_status: string;
  accompanying_readiness: string;
  email: string;
  phone: string;
  notes: string;
};

export type CommunityMemberFormState = {
  fieldErrors?: Partial<Record<keyof CommunityMemberFormValues, string>>;
  formError?: string;
  values?: CommunityMemberFormValues;
};

const communityMemberFormFields = [
  'first_name',
  'last_name',
  'gender',
  'marital_status',
  'consecrated_status',
  'community_engagement_status',
  'accompanying_readiness',
  'email',
  'phone',
  'notes',
] as const;

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export function communityMemberFormValuesFromForm(
  formData: FormData
): CommunityMemberFormValues {
  return {
    first_name: formText(formData, 'first_name'),
    last_name: formText(formData, 'last_name'),
    gender: formText(formData, 'gender'),
    marital_status: formText(formData, 'marital_status'),
    consecrated_status: formText(formData, 'consecrated_status'),
    community_engagement_status: formText(formData, 'community_engagement_status'),
    accompanying_readiness: formText(formData, 'accompanying_readiness'),
    email: formText(formData, 'email'),
    phone: formText(formData, 'phone'),
    notes: formText(formData, 'notes'),
  };
}

function polishFieldError(field: string, code: string): string {
  if (field === 'first_name') {
    return 'Podaj imię.';
  }
  if (field === 'last_name') {
    return 'Podaj nazwisko.';
  }
  if (field === 'email') {
    return 'Podaj poprawny adres e-mail.';
  }
  if (field === 'phone') {
    return 'Telefon jest za długi.';
  }
  if (code === 'invalid_enum_value' || code === 'invalid_type') {
    return 'Wybierz poprawną wartość.';
  }
  return 'Popraw to pole.';
}

export function polishCommunityMemberWriteIssues(
  issues: { path: (string | number)[]; code: string }[]
): NonNullable<CommunityMemberFormState['fieldErrors']> {
  const fieldErrors: NonNullable<CommunityMemberFormState['fieldErrors']> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (
      typeof field === 'string' &&
      communityMemberFormFields.includes(field as (typeof communityMemberFormFields)[number]) &&
      !fieldErrors[field as keyof CommunityMemberFormValues]
    ) {
      fieldErrors[field as keyof CommunityMemberFormValues] = polishFieldError(
        field,
        issue.code
      );
    }
  }

  return fieldErrors;
}
