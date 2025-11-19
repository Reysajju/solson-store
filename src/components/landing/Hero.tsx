import { Button } from '@/components/ui/button'
import { BookOpen, ShieldCheck, RefreshCw, Truck } from 'lucide-react'

export function Hero() {
  const trustIcons = [
    { icon: BookOpen, text: "Verified Publisher" },
    { icon: ShieldCheck, text: "Secure Checkout" },
    { icon: RefreshCw, text: "30-day Money-Back" },
    { icon: Truck, text: "Fast Shipping" },
  ]

  return (
    <section className="relative bg-gray-50 py-20 px-4 text-center">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Buy quality books from Solson Publications</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">New releases, bestsellers, and academic titles — direct from the publisher.</p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" asChild><a href="/catalog">Shop Bestsellers</a></Button>
          <Button size="lg" variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50" asChild><a href="#categories">Browse New Releases</a></Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-600">
          {trustIcons.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <item.icon className="w-5 h-5 text-blue-900" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
