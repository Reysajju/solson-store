export function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-blue-900">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">1. Order Your Books</h3>
            <p className="text-gray-600">Browse our extensive catalog and add your desired books to the cart.</p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">2. Fast Shipping</h3>
            <p className="text-gray-600">We process and ship your order promptly, with estimated delivery times provided at checkout.</p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">3. Enjoy or Return</h3>
            <p className="text-gray-600">Enjoy your new books! If you're not satisfied, we offer a 30-day money-back guarantee.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
