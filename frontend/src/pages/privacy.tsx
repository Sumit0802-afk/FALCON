import LegalPage, { LEGAL_CONTACT } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This page explains what Falcon keeps about you, why, who else handles it, and how to have it removed. Falcon does not sell your information and shows no advertising."
    >
      <section>
        <h2>What Falcon keeps</h2>
        <ul>
          <li><strong>Your account:</strong> your name and email address, and your password, which is stored only as a one-way hash that cannot be turned back into the password.</li>
          <li><strong>Signing in with Google:</strong> if you choose Continue with Google, Google tells Falcon your name, email address and profile picture. Falcon does not see your Google password and asks for nothing else.</li>
          <li><strong>Sign-in codes and sessions:</strong> the one-time codes emailed to you are stored only as hashes and expire after five minutes. For each signed-in session Falcon keeps the time, your IP address and the name of your browser, so you can see and end your sessions.</li>
          <li><strong>What you make:</strong> your designs, presentations, email designs, favourites and the pictures you upload.</li>
          <li><strong>In your browser:</strong> your sign-in token and preferences such as the theme and your Brand Kit are kept in your own browser, not on Falcon&apos;s servers.</li>
        </ul>
      </section>

      <section>
        <h2>How it is used</h2>
        <p>Only to run Falcon for you: to sign you in, keep your work, send the emails you ask Falcon to send, and answer you when you contact support. Falcon does not use your information for advertising and does not sell or rent it to anyone.</p>
      </section>

      <section>
        <h2>Who else handles it</h2>
        <p>Falcon uses a few services to work. Each receives only what it needs:</p>
        <ul>
          <li><strong>Vercel</strong> hosts the website and its server, and <strong>Neon</strong> hosts the database where your account and work are kept.</li>
          <li><strong>Google (Gmail)</strong> delivers the emails Falcon sends: sign-in codes, password reset links, and the email designs you send to the addresses you enter.</li>
          <li><strong>Google (Gemini)</strong> receives the words and any reference pictures you give AI Studio and the AI tools, to write and plan the design you asked for.</li>
          <li><strong>Pexels and Unsplash</strong> supply stock photographs; Falcon sends them search words, never your details.</li>
          <li><strong>Google Sign-In</strong> handles Continue with Google, under Google&apos;s own privacy policy.</li>
        </ul>
      </section>

      <section>
        <h2>Emails you send to other people</h2>
        <p>When you send a design from the Email Designer, the addresses you enter are used only to deliver that email, each person receiving their own copy. Only send to people who expect to hear from you.</p>
      </section>

      <section>
        <h2>How long it is kept, and removing it</h2>
        <p>Your account and work are kept until you ask for them to be removed. Uploaded pictures stay until you delete them. To have your account and everything in it deleted, or to get a copy of what Falcon holds about you, email <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a> from the address on your account.</p>
      </section>

      <section>
        <h2>Security</h2>
        <p>Passwords and sign-in codes are stored only as hashes, connections use HTTPS, and each person can only open their own designs. No system is perfectly secure, so please use a password you do not use anywhere else.</p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Falcon is not meant for children under 13, and does not knowingly keep information about them.</p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>If this policy changes, the date at the top changes with it. Questions are welcome at <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>.</p>
      </section>
    </LegalPage>
  );
}
