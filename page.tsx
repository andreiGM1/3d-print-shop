import React from 'react';
import { motion } from 'framer-motion';

export default function ThreeDPrintShop() {
  return (
    <div className="min-h-screen bg-stone-900 font-sans text-stone-300">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-stone-900/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-orange-500">△</span> LayerByLayer
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#arhitectura" className="font-medium hover:text-orange-400 transition-colors">Arhitectură</a>
            <a href="#piese" className="font-medium hover:text-orange-400 transition-colors">Piese Custom</a>
            <a href="#etsy" className="font-medium hover:text-orange-400 transition-colors">Magazin Etsy</a>
          </div>
          <a href="#comanda" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20">
            Încarcă Fișier STL
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium px-4 py-1.5 rounded-full text-sm mb-6"
            >
              🖨️ FDM & Resin 3D Printing
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-tight"
            >
              Ideile tale,<br />
              <span className="text-orange-500">aduse în lumea fizică.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-stone-400 mb-10 font-medium leading-relaxed max-w-xl"
            >
              De la machete de arhitectură ultra-detaliate la piese de schimb funcționale și decorațiuni de interior. Printăm precis, rapid și accesibil.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <a href="#comanda" className="bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-500 transition-all">
                Cere Ofertă Print
              </a>
              <a href="https://etsy.com" target="_blank" rel="noreferrer" className="bg-stone-800 border border-stone-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:border-orange-500 hover:text-orange-400 transition-all">
                Vizitează Etsy
              </a>
            </motion.div>
          </div>
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="aspect-square bg-stone-800 rounded-2xl border border-stone-700 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute inset-0 flex items-center justify-center text-stone-600 flex-col">
                <span className="text-6xl mb-4">🏛️</span>
                <p>Placeholder: Poză Machetă Printată</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-stone-950 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { id: 'arhitectura', icon: '🏢', title: 'Machete Arhitectură', desc: 'Precizie milimetrică pentru studenți la arhitectură și birouri de proiectare. Detalii fine printate în Rășină sau PLA de înaltă calitate.' },
              { id: 'piese', icon: '⚙️', title: 'Piese Funcționale', desc: 'Ai nevoie de o piesă de schimb care nu se mai găsește? O modelăm 3D (CAD) și o printăm în materiale rezistente (PETG, ABS).' },
              { id: 'etsy', icon: '🎨', title: 'Decorațiuni & Etsy', desc: 'Produse originale de design interior, ghivece parametrice și accesorii inteligente disponibile direct pe magazinul nostru Etsy.' },
            ].map((srv, idx) => (
              <div key={idx} id={srv.id} className="bg-stone-900 p-8 rounded-2xl border border-stone-800 hover:border-orange-500/50 transition-colors group">
                <div className="text-4xl mb-6 bg-stone-800 w-16 h-16 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">{srv.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{srv.title}</h3>
                <p className="text-stone-400 leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Upload Section */}
      <section id="comanda" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-stone-700">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 text-center">Ai deja fișierul 3D?</h2>
            <p className="text-lg text-stone-400 mb-10 text-center">Trimite-ne modelul tău (.STL, .OBJ, .STEP) și îți calculăm prețul pe loc în funcție de greutate și material.</p>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-stone-400 mb-1">Nume Complet</label>
                  <input type="text" className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-1">Telefon / Email</label>
                  <input type="text" className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-stone-400 mb-1">Material Preferat</label>
                <select className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500">
                  <option>PLA (Standard, Ieftin, Culori diverse)</option>
                  <option>PETG (Rezistent mecanic, pentru piese de schimb)</option>
                  <option>Rășină / Resin (Detalii extreme, Miniaturi)</option>
                  <option>Nu știu, am nevoie de recomandare</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-stone-700 rounded-xl p-10 text-center hover:border-orange-500 hover:bg-orange-500/5 transition-colors cursor-pointer">
                <span className="text-4xl mb-2 block">📁</span>
                <p className="text-white font-bold">Click pentru a încărca fișierul 3D</p>
                <p className="text-sm text-stone-500 mt-1">.STL, .OBJ, .STEP (Max 50MB)</p>
              </div>

              <button className="w-full bg-orange-600 text-white font-bold text-lg p-4 rounded-lg hover:bg-orange-500 transition-colors">
                Cere Estimare Preț
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-stone-950 py-8 text-center text-stone-600 border-t border-stone-900">
        <p>© 2026 LayerByLayer 3D Print. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
}
