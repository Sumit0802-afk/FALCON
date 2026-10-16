import Link from "next/link";
import LegalPage, { LEGAL_CONTACT } from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms are the rules for using Falcon. By creating an account or using Falcon, you agree to them."
    >
      <section>
        <h2>Your account</h2>
        <p>Give a real email address you can receive mail at, keep your password to yourself, and tell us if you think someone else has used your account. You are responsible for what happens under your account.</p>
      </section>

      <section>
        <h2>Your work</h2>
        <p>What you make in Falcon is yours. Falcon keeps it only to store it, show it to you and do what you ask with it, such as exporting or emailing it. Templates and stock photographs come with their own terms of use, which apply when you use them in your work.</p>
      </section>

      <section>
        <h2>Using Falcon fairly</h2>
        <ul>
          <li>Do not use Falcon to send spam, or to email people who have not agreed to hear from you.</li>
          <li>Do not upload or make anything illegal, hateful, or that copies someone else&apos;s work without permission.</li>
          <li>Do not try to break into Falcon, other people&apos;s accounts, or the services Falcon uses.</li>
        </ul>
        <p>Accounts that break these rules may be suspended or removed.</p>
      </section>

      <section>
        <h2>AI features</h2>
        <p>AI Studio and the AI tools can make mistakes. Check what they write and produce before you publish or send it, especially names, dates, prices and other facts.</p>
      </section>

      <section>
        <h2>The service</h2>
        <p>Falcon is offered as it is, and may change, pause or stop. Keep your own copies of anything important by exporting it. Falcon is not liable for losses that come from using it or from it being unavailable, as far as the law allows.</p>
      </section>

      <section>
        <h2>Your information</h2>
        <p>How Falcon handles your information is set out in the <Link href="/privacy">Privacy Policy</Link>.</p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>If these terms change, the date at the top changes with it, and using Falcon after that means you accept the new terms. Questions are welcome at <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>.</p>
      </section>
    </LegalPage>
  );
}
