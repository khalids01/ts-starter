import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What's included in the TS Starter?",
    answer:
      "It includes everything you need to launch a SaaS: Authentication (Better Auth), Database (Prisma), UI Components (Shadcn/UI), Styling (Tailwind 4), and much more.",
  },
  {
    question: "Is it easy to customize the design?",
    answer:
      "Yes! We use Tailwind CSS 4 and Shadcn/UI, making it extremely easy to customize every aspect of the design to match your brand.",
  },
  {
    question: "Can I use this for commercial projects?",
    answer:
      "Absolutely. The starter is designed precisely for that. You can use it to build any SaaS, landing page, or web application you want.",
  },
  {
    question: "Do you provide regular updates?",
    answer:
      "We keep all dependencies up to date and regularly add new features and components based on community feedback.",
  },
  {
    question: "What is the tech stack?",
    answer:
      "The stack includes Tanstack Start, React 19, Prisma, Better Auth, Tailwind 4, and Vite.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about the TS Starter template.
          </p>
        </div>

        <Accordion className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="px-6 border border-border rounded-xl"
            >
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
