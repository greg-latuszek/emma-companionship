import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { PageTitle } from '@/components/PageTitle';
import { SemiTransparentLink } from '@/components/SemiTransparentButton';
import { signInFailureCopy } from '@/lib/unavailable-database';

export default function SignInErrorPage() {
  return (
    <PageBackground
      imageSource="/docs/img/Christ_and_st_Menas.webp"
      imageAlt="Christ and St. Menas Background"
    >
      <AppArea>
        <Navbar />

        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <main className="flex flex-col items-center text-center px-6 sm:px-12 md:px-24 max-w-4xl">
            <PageTitle delay={0.3}>emmaCompanionship</PageTitle>
            <div className="w-20 h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0 mb-8 md:mb-10" />
            <p className="max-w-xl text-base sm:text-lg md:text-xl leading-relaxed text-white/85 font-sans font-light tracking-wide drop-shadow-md mb-10">
              {signInFailureCopy()}
            </p>
            <SemiTransparentLink href="/" delay={0.6}>
              Wróć
            </SemiTransparentLink>
          </main>
        </div>
      </AppArea>
    </PageBackground>
  );
}
