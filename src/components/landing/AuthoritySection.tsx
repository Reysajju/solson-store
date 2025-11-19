export function AuthoritySection() {
  return (
    <section id="about" className="py-16 px-4 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-blue-900">Why Buy From Solson Publications?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Publisher Experience</h3>
            <p className="text-gray-600">Decades of experience in curating and publishing high-quality academic and professional content.</p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Editorial Quality</h3>
            <p className="text-gray-600">Our books are meticulously edited to ensure clarity, accuracy, and impact.</p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Author Partnerships</h3>
            <p className="text-gray-600">We partner with leading experts and authors to bring you authoritative and groundbreaking work.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
