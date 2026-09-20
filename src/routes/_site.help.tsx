import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_site/help")({
  head: () => ({
    meta: [
      { title: "Help & support — SmartBus" },
      {
        name: "description",
        content: "Answers about SmartBus bookings, seat holds, cancellations and refunds.",
      },
      { property: "og:title", content: "Help & support — SmartBus" },
      { property: "og:description", content: "Booking, cancellation and refund questions answered." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const faqs = [
  {
    question: "How long are my seats held?",
    answer:
      "Seats are held for 5 minutes from the moment you select the first one. A countdown is shown on the seat page; if it runs out your selection clears and you can pick again.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes. Open My Bookings, pick a confirmed booking and choose Cancel booking. Free cancellation up to 24 hours before departure, 50% refund between 24 and 6 hours, no refund within 6 hours.",
  },
  {
    question: "Where do I find my e-ticket?",
    answer:
      "Every confirmed booking has a View e-ticket link with a QR code. You can print it or save it as a PDF from your browser's print dialog.",
  },
  {
    question: "Which payment methods are supported?",
    answer:
      "UPI, credit or debit card and net banking. This demo uses a simulated payment gateway, so no real money is charged.",
  },
];

function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight">Help &amp; support</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Common questions about booking on SmartBus.
      </p>

      <Accordion type="single" collapsible className="mt-6">
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="surface-card mt-8 p-5">
        <h2 className="font-semibold">Still need a hand?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Our travel desk is available 24×7.</p>
        <p className="mt-3 flex items-center gap-2 text-sm">
          <Phone className="size-4 text-primary" aria-hidden="true" /> 1800 123 4567
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <Mail className="size-4 text-primary" aria-hidden="true" /> support@smartbus.in
        </p>
      </div>
    </div>
  );
}
