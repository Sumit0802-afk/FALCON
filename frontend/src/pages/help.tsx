import { FormEvent, useState } from "react";
import { ChevronDown } from "lucide-react";
import AccountShell, { FIELD, LABEL, Notice, PRIMARY_BUTTON, Panel } from "@/components/AccountShell";
import { ApiError } from "@/services/api";
import { SupportTopic, contactSupport } from "@/services/authService";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I sign in?",
    answer: "Enter your email and password on the login page. Falcon then emails you a 6-digit code; type it in to finish signing in. The code works for 5 minutes, and you can ask for a new one after a minute.",
  },
  {
    question: "I didn't get my verification code.",
    answer: "Check your spam or promotions folder first. Codes can take a minute to arrive. If nothing comes, use Resend OTP on the code screen. After several requests in an hour you'll need to wait before trying again.",
  },
  {
    question: "Where are my designs saved?",
    answer: "Poster and social designs are under My projects. Emails you save in the Email Designer are under Email Templates, in the My Templates tab. Both save automatically while you work.",
  },
  {
    question: "How do I start from a template?",
    answer: "Open Templates for posters or Email Templates for emails, pick one, and choose to use it. Falcon makes your own copy, so the original is never changed.",
  },
  {
    question: "How do I add a link to a button in an email?",
    answer: "Click the button in the Email Designer. A Link box appears above it and at the top of the panel on the right. Paste the address there.",
  },
  {
    question: "How do I send an email I designed?",
    answer: "In the Email Designer choose Send Email, add up to 25 recipients and a subject, and send. Replies come back to your account email. To see it in your own inbox first, open More and choose Send test to me.",
  },
  {
    question: "How do I change my password?",
    answer: "Go to My account and use the Password section. If you've forgotten it, use Forgot password on the login page to get a reset link by email.",
  },
  {
    question: "Why does the editor stay dark in light theme?",
    answer: "The light theme changes how colours are shown on screen. The editors are left alone so the colours in your design match what you export.",
  },
];

const TOPICS: { id: SupportTopic; label: string }[] = [
  { id: "general", label: "General question" },
  { id: "account", label: "Account or sign-in" },
  { id: "bug", label: "Something isn't working" },
  { id: "billing", label: "Billing" },
  { id: "feedback", label: "Feedback or idea" },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06]">
      {FAQS.map((faq, index) => (
        <li key={faq.question}>
          <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-[13.5px] text-white">
            {faq.question}
            <ChevronDown size={15} className={`shrink-0 text-zinc-500 transition-transform ${open === index ? "rotate-180" : ""}`} />
          </button>
          {open === index && <p className="px-4 pb-4 text-[13px] leading-relaxed text-zinc-400">{faq.answer}</p>}
        </li>
      ))}
    </ul>
  );
}

function ContactForm({ email }: { email?: string }) {
  const [topic, setTopic] = useState<SupportTopic>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) return setStatus({ kind: "error", text: "Please add a short subject." });
    if (message.trim().length < 10) return setStatus({ kind: "error", text: "Please tell us a little more so we can help." });
    setSending(true);
    setStatus(null);
    try {
      await contactSupport({ topic, subject: subject.trim(), message: message.trim() });
      setSubject("");
      setMessage("");
      setStatus({ kind: "ok", text: `Your message has been sent. We'll reply to ${email || "your account email"}.` });
    } catch (err) {
      let text = "We couldn't reach Falcon. Check your connection and try again.";
      if (err instanceof ApiError) {
        text = err.status === 429 ? "You've sent several messages. Please wait a while before sending another."
          : err.status === 401 ? "Your session has ended. Please sign in again."
          : err.status === 400 ? err.message.replace(/^[a-zA-Z.0-9]+: /, "")
          : "We couldn't send your message. Please try again in a moment.";
      }
      setStatus({ kind: "error", text });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="help-topic" className={LABEL}>Topic</label>
          <select id="help-topic" value={topic} onChange={(e) => setTopic(e.target.value as SupportTopic)} className={`${FIELD} [&>option]:bg-[#0b0f14]`}>
            {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="help-subject" className={LABEL}>Subject</label>
          <input id="help-subject" type="text" value={subject} maxLength={150} onChange={(e) => setSubject(e.target.value)} className={FIELD} placeholder="What do you need help with?" />
        </div>
      </div>
      <div>
        <label htmlFor="help-message" className={LABEL}>Message</label>
        <textarea id="help-message" value={message} maxLength={4000} rows={6} onChange={(e) => setMessage(e.target.value)} className={`${FIELD} h-auto resize-y py-3 leading-relaxed`} placeholder="Describe what happened and what you expected." />
        <div className="mt-1 text-right text-[11px] text-zinc-600">{message.length} / 4000</div>
      </div>
      {status && <Notice kind={status.kind}>{status.text}</Notice>}
      <button type="submit" disabled={sending} className={PRIMARY_BUTTON}>{sending ? "Sending…" : "Send message"}</button>
    </form>
  );
}

export default function HelpPage() {
  return (
    <AccountShell title="Help & support" description="Quick answers, and a way to reach us.">
      {({ user }) => (
        <>
          <Panel title="Common questions">
            <Faq />
          </Panel>
          <Panel title="Contact support" hint="Your message is sent from your account, so we know who to reply to.">
            <ContactForm email={user?.email} />
          </Panel>
        </>
      )}
    </AccountShell>
  );
}
