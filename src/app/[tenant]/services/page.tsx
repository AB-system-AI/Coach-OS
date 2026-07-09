import { redirect } from "next/navigation";

type Props = { params: Promise<{ tenant: string }> };

export default async function ServicesRedirectPage({ params }: Props) {
  const { tenant } = await params;
  redirect(`/${tenant}/recovery`);
}
