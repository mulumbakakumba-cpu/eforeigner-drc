import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ServiceCard from "../components/ServiceCard";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="bg-slate-100 min-h-screen">
      <Navbar />

      <Hero />

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900">
            Nos services
          </h2>

          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Accédez aux principaux services d'immigration de la
            République démocratique du Congo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard
            icon="📄"
            title="Demande de visa"
          />

          <ServiceCard
            icon="🏠"
            title="Permis de séjour"
          />

          <ServiceCard
            icon="💼"
            title="Permis de travail"
          />

          <ServiceCard
            icon="🔎"
            title="Suivre une demande"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}