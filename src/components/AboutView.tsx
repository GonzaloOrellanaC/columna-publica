import React from 'react';
import { BookOpen, Award, Scale } from 'lucide-react';

interface AboutViewProps {
  onNavigateHome: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white font-sans space-y-12">
      
      {/* 2. Brand summary banner */}
      <section className="text-center space-y-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold-300">Misión y Principios</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-white">
          Línea Editorial de Alto Estándar
        </h1>
        <p className="text-sm text-white/75 leading-relaxed max-w-2xl mx-auto italic">
          "La preservación de la república requiere una voz libre, exenta de sesgo partidista crudo y sustentada en la profundidad de la geografía, la demografía y las reformas racionales."
        </p>
      </section>

      {/* Grid: Columns of value */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-3 shadow-md hover:bg-white/10 transition-all">
          <Scale className="w-8 h-8 text-gold-300" />
          <h3 className="font-serif text-sm font-bold uppercase text-white">Rigor Académico</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Nuestros columnistas son doctores en derecho constitucional, economistas internacionales y consultores estratégicos de primer nivel.
          </p>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-3 shadow-md hover:bg-white/10 transition-all">
          <Award className="w-8 h-8 text-rose-400" />
          <h3 className="font-serif text-sm font-bold uppercase text-white">Soberanía de Datos</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Resguardamos el debate ante la fragmentación de la información a nivel global, brindando un prisma netamente enfocado en el Cono Sur.
          </p>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-3 shadow-md hover:bg-white/10 transition-all">
          <BookOpen className="w-8 h-8 text-sky-300" />
          <h3 className="font-serif text-sm font-bold uppercase text-white">Gobernanza Soberana</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Analizamos cómo las macrotendencias globales repercuten e interactúan con la descentralización de las comunidades locales regionales.
          </p>
        </div>
      </section>

      {/* Content explaining how it works */}
      <section className="bg-[#0A192F]/20 border border-white/10 rounded-xl p-8 space-y-6 shadow-lg backdrop-blur-md">
        <h2 className="font-serif text-xl font-bold border-b border-white/10 pb-3 uppercase tracking-wider text-white">
          El Modelo Editorial
        </h2>
        
        <div className="space-y-4 text-xs text-white/80 leading-relaxed">
          <p>
            <strong>Columna Pública</strong> opera bajo una estructura de revisión editorial stricto sensu. 
            Cualquier redactor o columnista invitado posee una base de datos local donde gestiona sus borradores de índole académica. 
            Una vez finalizados, el borrador es sometido a un riguroso test a través del <strong>Director Supervisor o Super Administrador</strong>.
          </p>
          <p>
            Este rol de Super Administrador (actualmente registrado con el correo <strong>go.orellana.c@gmail.com</strong> bajo la contraseña por defecto <strong>admin123</strong>) 
            monitorea e inspecciona de forma pormenorizada cada frase, pudiendo aprobar la divulgación del artículo a la portada o devolverlo a borrador si no cumple con las directrices estéticas y técnicas.
          </p>
          <p>
            Alentamos a nuestro selecto público lector a comentar constructivamente las columnas, ingresando sus credenciales de manera transparente a fin de mantener un clima cívico ejemplar.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-white font-serif font-bold text-xs uppercase tracking-wider rounded-md transition-colors cursor-pointer border border-transparent"
          >
            Comenzar Lectura de Columnas
          </button>
        </div>
      </section>

    </div>
  );
};
