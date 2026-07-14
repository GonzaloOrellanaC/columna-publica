import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SiteSettings, User } from "../types";
import { ArrowLeft } from "lucide-react";
import { createSlug } from "../utils/slug";

interface ColumnistProfileProps {
  settings: SiteSettings;
  users: User[];
  usersLoading: boolean;
}

export const ColumnistProfile: React.FC<ColumnistProfileProps> = ({ settings, users, usersLoading }) => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const person = users.find(
    (u) => createSlug(u.name) === name
  );

  if (usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Cargando perfil...
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Columnista no encontrado.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-sans text-slate-100">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center text-sm text-[#dfba53] hover:text-[#cfa543] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver
      </button>

      <div className="bg-[#040e1f] border border-slate-900 rounded-2xl p-8 sm:p-12 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img
            src={person.avatar}
            alt={person.name}
            className="w-40 h-40 rounded-full object-cover border-4 border-[#dfba53]/25 mb-6 shadow-lg"
          />
          <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white tracking-widest mb-2">
            {person.name}
          </h1>
          <p className="text-lg font-mono text-[#dfba53] mb-6 uppercase tracking-wider">
            {person.role === 'admin' ? 'Director General' : person.role === 'editor' ? 'Editor Senior' : 'Columnista Permanente'}
          </p>
          <p className="text-slate-300 font-serif leading-relaxed text-lg">
            {person.bio || 'Consorciador académico de ciencias políticas o economía soberanas en opinión internacional.'}
          </p>
        </div>
      </div>
    </div>
  );
};
