
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqItems: FaqItem[];
}

export const FaqSection = ({ faqItems }: FaqSectionProps) => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-ezgray max-w-2xl mx-auto">
            Have more questions? Contact our support team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-ezgray-dark rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
              <p className="text-ezgray">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
