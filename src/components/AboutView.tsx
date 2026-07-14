import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Article } from "../types";
import { Award, BookOpen, Compass, ShieldCheck, Users } from "lucide-react";
import { JoinUsSection } from "./JoinUsSection";
import { createSlug } from "../utils/slug";

interface AboutViewProps {
  users: User[];
  articles: Article[];
}

export const AboutView: React.FC<AboutViewProps> = ({ users, articles }) => {
  const [writerList, setWriterList] = useState<User[]>(users);

  useEffect(() => {
    if (users && users.length > 0) {
      setWriterList(users);
    } else {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.users) {
            setWriterList(data.users);
          }
        })
        .catch((err) => console.error("Error fetching users in AboutView", err));
    }
  }, [users]);

  // Filter active academic writers
  const activeWriters = writerList.filter(u => 
    (u.role === 'admin' || u.role === 'columnist' || u.role === 'editor') && 
    u.email !== 'admin@columnapublica.cl'
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">
      
      {/* Title & Core Philosophy */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="font-cinzel text-3xl font-extrabold tracking-widest text-[#dfba53]">
          LÍNEA EDITORIAL
        </h2>
        <div className="h-[2px] w-12 bg-[#dfba53] mx-auto"></div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-mono">
          Nuestra Declaración Doctrinaria de la Opinión Soberana
        </p>
      </div>

      {/* Grid: Concept details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pilar 1: Rigor Académico */}
        <div className="bg-[#051122] border border-slate-800 p-6 rounded-xl hover:border-[#dfba53]/35 transition-all space-y-4 shadow-lg">
          <div className="p-3 bg-[#dfba53]/10 text-[#dfba53] rounded-lg w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-white">Rigor Técnico y Académico</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Cada columna publicada pasa por la supervisión de un Editor de Sección. No fomentamos la opinión reactiva inmediata; preferimos disertaciones estructurales con marco conceptual y rigor de excelencia.
          </p>
        </div>

        {/* Pilar 2: Soberanía */}
        <div className="bg-[#051122] border border-slate-800 p-6 rounded-xl hover:border-[#dfba53]/35 transition-all space-y-4 shadow-lg">
          <div className="p-3 bg-[#dfba53]/10 text-[#dfba53] rounded-lg w-fit">
            <Compass className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-white">Pensamiento Multipolar</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Analizamos la macroeconomía global y las divisas del Cono Sur desde una perspectiva autónoma, promoviendo la soberanía de datos y energética para el reordenamiento del continente.
          </p>
        </div>

        {/* Pilar 3: Transparencia */}
        <div className="bg-[#051122] border border-slate-800 p-6 rounded-xl hover:border-[#dfba53]/35 transition-all space-y-4 shadow-lg">
          <div className="p-3 bg-[#dfba53]/10 text-[#dfba53] rounded-lg w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-white">Consorcio Técnico Libre</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Sustentamos el libre flujo de la pluma. Nuestras fuentes estratégicas son protegidas en base a rigurosos marcos de encriptamiento y descentralización de bases de datos.
          </p>
        </div>

      </div>

      {/* Directory of premium authors */}
      <div className="space-y-8">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="font-cinzel text-xl font-bold tracking-wider text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-[#dfba53]" />
            CONSEJO TÉCNICO Y AUTORES COOPERADORES
          </h3>
          <p className="text-xs text-slate-400 font-mono">Consorcio oficial registrado en Columna Pública</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeWriters.map(writer => {
            // Count total published columns by this author
            const numColumns = articles.filter(a => a.authorId === writer.id && a.status === 'published').length;
            const slug = createSlug(writer.name);

            return (
              <Link
                key={writer.id}
                to={`/columnista/${slug}`}
                className="bg-gradient-to-b from-[#051122] to-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-[#dfba53]/30 transition-all shadow-md block"
              >
                <div className="space-y-4">
                  {/* Photo Profile */}
                  <div className="flex items-center space-x-4">
                    <img 
                      src={writer.avatar} 
                      alt={writer.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#dfba53]/30"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white font-serif">{writer.name}</h4>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#dfba53]">
                        {writer.role === 'admin' ? '👑 Director General' : writer.role === 'editor' ? '👓 Editor Senior' : '✒️ Columnista Permanente'}
                      </span>
                    </div>
                  </div>

                  {/* Bio biography */}
                  <p className="text-xs text-slate-300 font-serif leading-relaxed italic line-clamp-3">
                    "{writer.bio || 'Consorciador académico de ciencias políticas o economía soberanas en opinión internacional.'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-900 flex justify-end items-center text-[10px] font-mono text-slate-500">
                  <span className="flex items-center space-x-1 text-slate-400">
                    <BookOpen className="w-3.5 h-3.5 text-[#dfba53]" />
                    <span>{numColumns} Columnas Publicadas</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Columnist application invitation and contact form */}
      <JoinUsSection />

    </div>
  );
};
export default AboutView;
