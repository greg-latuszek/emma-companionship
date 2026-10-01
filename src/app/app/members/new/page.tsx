import { redirect } from 'next/navigation';

export default function AddCommunityMemberPage() {
  redirect('/app/members?tab=new');
}
