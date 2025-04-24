
const testimonials = [
  {
    quote: "EzEdit.co has saved me countless hours maintaining our legacy intranet. I can make updates in seconds that used to take hours.",
    author: "Sarah L.",
    position: "IT Director",
    company: "Global Manufacturing Inc."
  },
  {
    quote: "As a non-technical marketing manager, I can now update our website without bugging our developers. The AI actually understands what I want!",
    author: "Michael R.",
    position: "Marketing Manager",
    company: "Retail Solutions"
  },
  {
    quote: "We have dozens of legacy PHP sites. EzEdit has become our go-to tool for quick fixes and content updates. Brilliant tool.",
    author: "David K.",
    position: "CTO",
    company: "AgencyBright"
  }
];

const TestimonialSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-ezgray max-w-2xl mx-auto">
            Join thousands of satisfied users who have revolutionized how they maintain legacy websites.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-eznavy-light p-6 rounded-lg border border-ezgray-dark">
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-ezblue">★</span>
                ))}
              </div>
              <blockquote className="mb-4">
                <p className="text-ezgray">"{testimonial.quote}"</p>
              </blockquote>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-ezgray text-sm">{testimonial.position}, {testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
