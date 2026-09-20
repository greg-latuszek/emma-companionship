import { PageBackground } from '@/components/PageBackground';
import { Navbar } from '@/components/Navbar';
import { PageTitle } from '@/components/PageTitle';
import { SemiTransparentLink } from '@/components/SemiTransparentButton';
import { signInFailureCopy } from '@/lib/unavailable-database';

export default async function SignInErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-white font-serif select-none overflow-hidden relative">
      <PageBackground
        imageSource="/docs/img/Christ_and_st_Menas.webp"
        imageAlt="Christ and St. Menas Background"
      />

      <div className="absolute top-0 left-0 right-0 z-40">
        <Navbar />
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center z-20 relative px-4">
        <main className="flex flex-col items-center text-center px-6 sm:px-12 md:px-24 max-w-4xl">
          <PageTitle delay={0.3}>emmaCompanionship</PageTitle>
          <div className="w-20 h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0 mb-8 md:mb-10" />
          <p className="max-w-xl text-base sm:text-lg md:text-xl leading-relaxed text-white/85 font-sans font-light tracking-wide drop-shadow-md mb-10">
            {signInFailureCopy(errorCode)}
          </p>
          <SemiTransparentLink href="/" delay={0.6}>
            Wróć
          </SemiTransparentLink>
        </main>
      </div>
    </div>
  );
}
