import { redirect } from 'next/navigation';

export default async function AddCompanionshipRelationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const accompanied = (await searchParams).accompanied?.toString();
  const destination = accompanied
    ? `/app/companionships?tab=new&accompanied=${accompanied}`
    : '/app/companionships?tab=new';
  redirect(destination);
}
