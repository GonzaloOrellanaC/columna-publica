import { User, Article, ArticleCategory } from "../types";
import { hashPassword } from "./db";

export const SEED_USERS: User[] = [
  {
    id: "user-super-secondary",
    email: "admin@columnapublica.cl",
    passwordHash: hashPassword("admin123"),
    name: "Super Administrador",
    role: "admin",
    bio: "Director Editorial y Super Administrador General de Columna Pública.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-01T10:00:00Z"
  },
  {
    id: "user-felipe-munoz",
    email: "felipe.munoz@columnapublica.cl",
    passwordHash: hashPassword("felipe123"),
    name: "Felipe Muñoz Smirnow",
    role: "columnist",
    bio: "Psicoterapeuta Humanista Existencial Gestalt, Logoterapeuta y Analista Existencial.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-02T12:00:00Z"
  },
  {
    id: "user-antonia-catalan",
    email: "antonia.catalan@columnapublica.cl",
    passwordHash: hashPassword("antonia123"),
    name: "Antonia Catalán Troncoso",
    role: "editor",
    bio: "Directora General de Columna Pública.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-02T10:00:00Z"
  },
  {
    id: "user-camilo-carrera",
    email: "camilo.carrera@columnapublica.cl",
    passwordHash: hashPassword("camilo123"),
    name: "Camilo Carrera Orellana",
    role: "columnist",
    bio: "Director de Eco Glocal Media y columnista corporativo.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-03T11:00:00Z"
  },
  {
    id: "user-ruben-oyarzo",
    email: "ruben.oyarzo@columnapublica.cl",
    passwordHash: hashPassword("ruben123"),
    name: "Rubén Oyarzo",
    role: "columnist",
    bio: "Exdiputado de la República de Chile y Magíster Internacional en Instituciones Políticas Públicas.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-03T09:00:00Z"
  },
  {
    id: "user-nicolas-aguilera",
    email: "nicolas.aguilera@columnapublica.cl",
    passwordHash: hashPassword("nicolas123"),
    name: "Nicolas Aguilera",
    role: "columnist",
    bio: "Licenciado en Lengua y Literatura.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-04T08:00:00Z"
  },
  {
    id: "user-felipe-valenzuela",
    email: "felipe.valenzuela@columnapublica.cl",
    passwordHash: hashPassword("felipev123"),
    name: "Felipe Valenzuela Escobar",
    role: "columnist",
    bio: "Presidente Nacional - Juventud Liberal de Chile.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-04T12:00:00Z"
  },
  {
    id: "user-fernando-claro",
    email: "fernando.claro@columnapublica.cl",
    passwordHash: hashPassword("fernando123"),
    name: "Fernando Claro",
    role: "columnist",
    bio: "Economista y Director Ejecutivo de la FPP (Fundación para el Progreso).",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-05T15:00:00Z"
  },
  {
    id: "user-jose-caceres",
    email: "jose.caceres@columnapublica.cl",
    passwordHash: hashPassword("jose123"),
    name: "José Cáceres S.",
    role: "columnist",
    bio: "Cientista Político y Administrador Público.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-05T14:00:00Z"
  },
  {
    id: "user-javier-pascual",
    email: "javier.pascual@columnapublica.cl",
    passwordHash: hashPassword("javier123"),
    name: "Javier Pascual",
    role: "columnist",
    bio: "Investigador en Ciudadanía y Colectivos de Momento Ciudadano.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-06T10:00:00Z"
  },
  {
    id: "user-gabriela-boscan",
    email: "gabriela.boscan@columnapublica.cl",
    passwordHash: hashPassword("gabriela123"),
    name: "Gabriela Boscán",
    role: "columnist",
    bio: "Alumna de Periodismo y columnista independiente.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-06T11:00:00Z"
  },
  {
    id: "user-ricardo-fabrega",
    email: "ricardo.fabrega@columnapublica.cl",
    passwordHash: hashPassword("ricardo123"),
    name: "Dr. Ricardo Fábrega",
    role: "columnist",
    bio: "Presidente de la Corporación Alma Ata y consultor de políticas de salud.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-07T12:00:00Z"
  },
  {
    id: "user-uriel-gonzalez",
    email: "uriel.gonzalez@columnapublica.cl",
    passwordHash: hashPassword("uriel123"),
    name: "Uriel González",
    role: "columnist",
    bio: "Administrador Público y Coordinador Ejecutivo de la ONG En Modo Verde.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-08T09:00:00Z"
  },
  {
    id: "user-rodrigo-diaz",
    email: "rodrigo.diaz@columnapublica.cl",
    passwordHash: hashPassword("rodrigo123"),
    name: "Rodrigo Diaz",
    role: "columnist",
    bio: "Asesor territorial y especialista académico en gestión urbana y transporte.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-08T10:00:00Z"
  },
  {
    id: "user-jose-carrera",
    email: "jose.carrera@columnapublica.cl",
    passwordHash: hashPassword("josec123"),
    name: "José Carrera Orellana",
    role: "columnist",
    bio: "Fundador de Conchalí Centenario y analista de teoría política clásica y contemporánea.",
    avatar: "/default-avatar.svg",
    isDemo: false,
    createdAt: "2026-06-09T14:00:00Z"
  }
];

export const SEED_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Cuando la mente se queda sin techo",
    subtitle: "La indigencia no es solamente un fracaso económico. Es un fracaso espiritual de la civilización.",
    content: `Cuando la mente se queda sin techo

Por Felipe Muñoz Smirnow, Psicoterapeuta Humanista Existencial Gestalt y Logoterapeuta y Analista Existencial
Columna para el Repositorio Columna Pública.

La calle no comienza en la vereda. Comienza mucho antes. Comienza el día exacto en que alguien pide ayuda… y el mundo responde con un número de atención, una lista de espera o una sonrisa burocrática entrenada para parecer humanidad. Comienza cuando una mujer dice “no puedo más” y recibe clonazepam en vez de escucha. Cuando un adolescente anuncia su derrumbe en redes sociales durante meses y los adultos lo llaman “drama y show”. Cuando un hombre devastado por dentro sigue trabajando doce horas diarias porque en esta civilización el sufrimiento sólo importa cuando deja de producir.

La calle no empieza cuando aparece el cartón. Empieza cuando desaparece el vínculo. Y quizá ésa sea la verdad más obscena de nuestro tiempo: la indigencia no es solamente un fracaso económico. Es un fracaso espiritual de la civilización.

El derrumbe siempre ocurre en cámara lenta

Nadie colapsa de golpe. Eso es un mito narrativo inventado por las sociedades que no quieren asumir responsabilidad sobre el sufrimiento humano. Toda caída es lenta. Toda destrucción tiene prólogo. Toda persona rota emitió señales antes de quebrarse. Pero vivimos en una cultura demasiado acelerada para escuchar el lenguaje lento del dolor. Porque el sufrimiento verdadero no siempre grita. A veces bosteza. A veces llega puntual al trabajo. A veces sonríe. A veces sigue pagando cuentas mientras por dentro el alma se desmorona como una ciudad bombardeada. Y ahí está la tragedia: el sistema contemporáneo fue diseñado para reaccionar frente al escándalo visible, no frente al deterioro silencioso. Entonces el Estado aparece recién cuando la persona ya perdió la casa. Cuando ya perdió la pareja. Cuando ya perdió el cuerpo. Cuando ya perdió la voluntad. Cuando ya perdió incluso el idioma para explicar lo que le pasa. Y para entonces, muchas veces, ya no queda un ciudadano. Sólo queda alguien sobreviviendo.

El neoliberalismo convirtió el dolor en una falla personal

Ésta es una de las operaciones ideológicas más violentas de la modernidad. Nos enseñaron que todo fracaso es individual.

Si estás deprimido: gestiona mejor tus emociones. Si colapsaste: organízate. Si no puedes levantarte de la cama: haz ejercicio. Si la vida perdió sentido: medita. Como si el alma humana fuera una aplicación mal configurada. Como si décadas de trauma pudieran resolverse viendo reels motivacionales. Como si la precarización emocional fuera un problema de actitud. Y así nace el gran monstruo contemporáneo: millones de personas culpándose por heridas que fueron producidas socialmente.

Byung-Chul Han entendió que la tragedia moderna ya no es la represión externa. Es la autoexplotación. El sujeto contemporáneo se transforma simultáneamente en víctima y verdugo de sí mismo.

Se exige. Se optimiza. Se sobrecarga. Se compara. Se exprime hasta la última gota de energía nerviosa. Y cuando finalmente colapsa, el sistema le pregunta por qué no fue suficientemente resiliente. La civilización actual no abraza al agotado. Lo diagnostica. Toda persona en situación calle es un archivo humano de conversaciones que nadie sostuvo a tiempo.

Como psicoterapeuta uno aprende algo terrible: la mayoría de las personas no llega destruida por un solo evento. Llega destruida por acumulación. Microabandonono tras microabandono. Humillación tras humillación. Silencio tras silencio. Trauma tras trauma. Hasta que un día la estructura interna simplemente ya no soporta más peso.

Y entonces aparece la adicción.

Pero muchas veces la droga no es el problema. Es anestesia. Aparece la agresividad. Pero muchas veces la violencia no es maldad. Es un sistema nervioso viviendo en guerra permanente. Aparece la apatía. Pero muchas veces no es flojera. Es agotamiento traumático extremo.

La sociedad mira síntomas. La psicoterapia escucha biografías. Y detrás de muchísimas personas en situación calle hay infancias completas llenas de abandono emocional, abuso, precariedad afectiva, negligencia, violencia intrafamiliar, desregulación vincular y soledad radical. Pero el sistema llega tarde. Siempre tarde. Porque los Estados modernos son extraordinarios administrando consecuencias y espantosamente inútiles previniendo sufrimiento humano.

La salud mental sigue siendo el sótano olvidado de la salud pública. Ésta es una verdad brutal. Todavía hay países donde conseguir atención psicológica o psiquiátrica digna depende del nivel socioeconómico. Como si el derecho a no derrumbarse fuese un privilegio de clase. Y mientras tanto los gobiernos hablan de crecimiento económico, seguridad y desarrollo, ignorando que una población emocionalmente destruida jamás podrá construir cohesión social real.

Porque la salud mental no es un accesorio progresista. Es infraestructura civilizatoria. Sin salud mental: la democracia se erosiona. La violencia aumenta. La desesperanza se multiplica. Las adicciones explotan. El tejido comunitario se pudre. La gente deja de proyectar futuro. Y un país sin futuro emocional termina convirtiéndose lentamente en una maquinaria de supervivencia administrada.

El gran Viktor Frankl comprendió algo que el presente olvidó mientras llenaba planillas Excel: el ser humano puede soportar muchísimo dolor… pero no puede soportar indefinidamente una vida vaciada de sentido. Y eso es exactamente lo que está ocurriendo.

No estamos frente a una simple crisis psiquiátrica. Estamos frente a una crisis de significado.

El verdadero colapso contemporáneo es vincular

La modernidad prometió hiperconexión. Y produjo soledad masiva. Nunca habíamos estado tan comunicados. Nunca habíamos estado tan solos. La gente ya no tiene tribu. Tiene algoritmos. Ya no tiene comunidad. Tiene interacción. Ya no tiene pertenencia. Tiene consumo compartido. Y un ser humano sin vínculo profundo comienza lentamente a devaluarse psicológicamente, aunque siga funcionando socialmente. Ésa es la epidemia silenciosa de esta época: personas operacionalmente vivas y emocionalmente muertas. Gente que desayuna ansiedad. Trabaja agotamiento. Cena vacío existencial. Y duerme abrazada a una fatiga que ya parece parte de su identidad. Después la sociedad se sorprende cuando alguien termina en la calle.

Pero la pregunta verdadera es otra: ¿cómo no iban a colapsar millones de personas dentro de una cultura que convirtió la fragilidad humana en un defecto de fabricación?

La burocracia puede matar sin tocar a nadie

Hay personas que mueren mucho antes del suicidio. Mueren cuando sienten que dejaron de importarle al mundo. Y pocas cosas producen esa sensación con tanta violencia como la indiferencia institucional. Una persona quebrada emocionalmente necesita presencia. Pero el sistema ofrece formularios. Necesita escucha. Pero recibe protocolos. Necesita humanidad. Pero obtiene derivaciones. Entonces comienza el deterioro. Lento. Invisible. Administrativo. Hasta que un día aparece un hombre hablando solo en una esquina y todos preguntan: “¿Cómo llegó a esto?”

No llegó. Fue empujado lentamente. Por años. Por omisión. Por abandono. Por negligencia emocional estructural. Porque hay violencias que no dejan hematomas. Pero igualmente destruyen cerebros, identidades y biografías completas.

La civilización será juzgada por cómo trató a quienes se quebraron

Tal vez el futuro mire esta época con horror. Tal vez digan: “Fue la era donde la productividad valía más que la vida interior.” La era donde millones de personas fueron medicadas para soportar existencias incompatibles con la naturaleza humana. La era donde la gente debía demostrar rendimiento incluso estando rota. La era donde pedir ayuda era considerado debilidad. La era donde el mercado aprendió a monetizar incluso la ansiedad.

Y mientras tanto, bajo los puentes, en plazas vacías, en hospitales colapsados y en departamentos silenciosos, millones de seres humanos seguían desmoronándose en cámara lenta. Invisibles para las estadísticas. Visibles para cualquier alma mínimamente despierta.

Porque toda persona en situación calle es una pregunta moral lanzada directamente al rostro de la sociedad. Una pregunta incómoda. Brutal. Ineludible. ¿Qué tipo de civilización necesita que un ser humano pierda absolutamente todo para recién comenzar a mirarlo? Y quizás la respuesta más aterradora sea ésta: una civilización que olvidó que antes de ciudadanos, consumidores o contribuyentes… éramos simplemente seres humanos necesitándose unos a otros para no caer al abismo.`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=600&q=80",
    status: "published",
    tags: ["Salud Mental", "Logoterapia", "Byung-Chul Han", "Viktor Frankl"],
    authorId: "user-felipe-munoz",
    authorName: "Felipe Muñoz Smirnow",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    createdAt: "2026-06-10T12:00:00Z",
    updatedAt: "2026-06-10T12:00:00Z",
    views: 0
  },
  {
    id: "art-2",
    title: "Editorial | El desafío de volver a conectar",
    subtitle: "La alarmante desconexión entre la agenda mediática y la experiencia de los territorios.",
    content: `Editorial | El desafío de volver a conectar

Por Antonia Catalán Troncoso, Directora de Columna Pública

En tiempos donde la información circula de manera inmediata y masiva, pareciera que la ciudadanía nunca había estado tan informada. Sin embargo, ocurre exactamente lo contrario: cada vez son más las personas que sienten distancia, desconfianza y desconexión frente a los medios tradicionales y frente a las realidades que estos intentan representar.

Columna Pública nace precisamente desde esa inquietud.

Nace desde la convicción de que comunicar no puede limitarse únicamente a transmitir información, sino que debe también generar comprensión, contexto y conexión con las personas. Cuando la comunicación pierde vínculo con la realidad cotidiana de la ciudadanía, se produce lo que hemos definido como un profundo descontexto social: una distancia peligrosa entre lo que vive la gente y lo que finalmente termina instalándose como verdad pública.

Durante años hemos observado cómo parte importante de la sociedad termina construyendo su visión del país únicamente desde aquello que otros deciden comunicar. En muchos casos, las personas reciben versiones parciales, interpretaciones limitadas o relatos alejados del territorio y de las experiencias reales de quienes viven día a día las consecuencias de las decisiones políticas, económicas y sociales.

Nuestro propósito no es defender posiciones ideológicas ni transformarnos en una tribuna de intereses particulares. Muy por el contrario: buscamos abrir espacios para escuchar, reflexionar y comprender la realidad desde múltiples miradas, promoviendo una ciudadanía más consciente, más informada y menos vulnerable a la manipulación, al miedo o a la ignorancia.

Creemos profundamente que Chile crece cuando su gente comprende. Cuando existe acceso a información fehaciente, cuando se fomenta el pensamiento crítico y cuando los medios vuelven a tener la capacidad de escuchar antes de hablar.

Por eso nuestra línea editorial estará siempre vinculada al territorio, a la experiencia social y a la voz ciudadana. Nos interesa recoger información desde el terreno, desde las comunidades, desde quienes muchas veces no encuentran espacios reales para expresar lo que viven o piensan.

Porque comunicar también es conectar. Y conectar significa escuchar. Ese será el compromiso de Columna Pública: contribuir a disminuir el descontexto social, promover debates con sentido, abrir espacios de participación y construir un medio donde la ciudadanía no solo sea espectadora de la información, sino también parte activa de ella.

La democracia necesita ciudadanos informados. Pero también necesita ciudadanos escuchados.`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
    status: "published",
    tags: ["Medios", "Editorial", "Democracia", "Chile"],
    authorId: "user-antonia-catalan",
    authorName: "Antonia Catalán Troncoso",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    createdAt: "2026-06-11T09:00:00Z",
    updatedAt: "2026-06-11T09:00:00Z",
    views: 0
  },
  {
    id: "art-3",
    title: "Cartas - transparencia",
    subtitle: "El valor del periodismo institucional serio frente a las tribunas de perfiles anónimos de internet.",
    content: `Señora Directora:

No creo que los medios de comunicación sean patrimonio exclusivo de los periodistas. Sin embargo, existe una gran diferencia entre un medio digital con un equipo formal y una dirección responsable, y aquellos que se esconden detrás de perfiles anónimos, negando el legítimo derecho de la ciudadanía a saber quiénes están detrás de la información que consumen.

Los primeros hacen periodismo.

Los segundos solo juegan a hacerlo.

Camilo Carrera Orellana
Director Eco Glocal Media`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    status: "published",
    tags: ["Transparencia", "Internet", "Prensa"],
    authorId: "user-camilo-carrera",
    authorName: "Camilo Carrera Orellana",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    createdAt: "2026-06-11T14:00:00Z",
    updatedAt: "2026-06-11T14:00:00Z",
    views: 0
  },
  {
    id: "art-4",
    title: "Aparece el nuevo Kast: el poeta de La Moneda",
    subtitle: "Análisis de la contradicción sobre la promesa electoral de la expulsión masiva de 300 mil migrantes.",
    content: `Aparece el nuevo Kast: el poeta de La Moneda

Por Rubén Oyarzo, Magíster en Instituciones Políticas Públicas
Columna para Biobio.cl

Hay mentiras que indignan. Y hay otras que, además de indignar, insultan la inteligencia de un país completo. Lo dicho por el Presidente Kast respecto a su promesa de expulsar a 300 mil migrantes entra exactamente en esa categoría: la del engaño descarado, adornado después con cinismo, soberbia y una explicación que parece escrita por un mal guionista político.

Porque no, Presidente. No era una “metáfora”.

Fue una promesa de campaña repetida una y otra vez frente a cámaras, en debates, entrevistas y redes sociales. Fue una bandera levantada para cosechar miedo, rabia y votos. Fue el combustible de un discurso construido sobre la idea de que Chile estaba desbordado y que usted sería el hombre fuerte capaz de poner orden donde otros, según decía, habían fracasado.

Y ahora, cuando la realidad le explota en la cara y las cifras no cuadran, aparece el nuevo Kast: no el líder duro e inflexible, sino “el poeta”.

Sí, el poeta. El hombre que transforma una promesa presidencial en figura literaria. El candidato que hablaba golpeando la mesa ahora pretende convencernos de que la ciudadanía “entendió mal”. Como si millones de personas hubieran escuchado mal. Como si las grabaciones no existieran. Como si la memoria colectiva pudiera borrarse con una frase improvisada desde un podio.

Lo más grave no es solo la contradicción. Lo verdaderamente peligroso es la lógica detrás de ella: prometer cualquier cosa para llegar al poder y, una vez instalado en La Moneda, relativizarlo todo. Hoy son los 300 mil migrantes. Mañana puede ser cualquier otra promesa.

Porque cuando un Presidente convierte sus compromisos en “metáforas”, entonces la palabra presidencial deja de valer. Y un país donde la palabra del Presidente no vale, entra en una crisis mucho más profunda que la migratoria.

Kast construyó gran parte de su campaña ofreciendo certezas absolutas a problemas complejos. Ese fue su negocio político. Mientras otros hablaban de cooperación internacional, reformas legales, control fronterizo o acuerdos diplomáticos, él ofreciía una solución rápida, agresiva y emocionalmente rentable: expulsiones masivas.

Sabía perfectamente lo que hacía. Sabía que la frase “300 mil expulsados” generaba impacto. Sabía que alimentaba la sensación de autoridad. Sabía que convertía la frustración social en apoyo político. Y también sabía —porque no es ingenuo— que ejecutar algo así era prácticamente imposible dentro del marco legal, administrativo y humanitario de cualquier democracia moderna.

Pero aun así lo prometió. Ahí está el corazón del problema. No estamos frente a un error comunicacional. Estamos frente a una estrategia consciente de exageración electoral. Una fórmula populista básica: decir lo que la gente quiere escuchar, aunque no exista ninguna posibilidad seria de cumplirlo.

Y aquí conviene poner los datos sobre la mesa. Entre el 11 de marzo y el 6 de mayo de 2026, el gobierno de Kast concretó 334 expulsiones de extranjeros, entre administrativas y judiciales, cifra que representa un aumento del 47,2% respecto del mismo periodo de 2022, incluso utilizando vuelos de expulsión de la FACH. Es decir, expulsiones sí existen y el Estado efectivamente las está ejecutando. El problema no es ese. El problema es haber prometido 300 mil expulsiones como si se tratara de una medida inmediata y viable, para después intentar reducir esa promesa a una simple “metáfora” cuando la realidad terminó desmintiendo el relato.

Y cuando llega la hora de responder, aparece el refugio clásico de los políticos acorralados: “era simbólico”, “era una manera de decir”, “se entendió fuera de contexto”.

No, Presidente. El contexto era clarísimo. La gente votó creyendo que usted haría exactamente lo que prometió. No una metáfora. No poesía. No literatura. Política pública.

Y por eso hoy existe tanta frustración incluso entre personas que apoyaban medidas más duras contra la inmigración irregular. Porque una cosa es exigir orden y otra muy distinta es sentirse utilizado electoralmente.

Chile tiene derecho a discutir con seriedad sobre migración, seguridad y control fronterizo. Ese debate existe en todas las democracias del mundo. Pero debe hacerse con responsabilidad, sin caricaturas y sin promesas imposibles diseñadas únicamente para ganar aplausos en campaña.

Porque mientras desde Santiago se discute semántica y metáforas, hay miles de familias viviendo una realidad mucho más dura.

Vecinos de Cerrillos llevan años denunciando el deterioro en sectores cercanos al campamento Nuevo Amanecer. En Maipú, la llamada “Pequeña Haití” se transformó en símbolo del abandono del Estado y de una convivencia quebrada, donde incluso quedó expuesta la presencia de redes criminales internacionales tras el caso del ex teniente venezolano Ronald Ojeda.

Y aquí es importante ser claros: el problema no es el migrante honesto que vino a trabajar, aportar y construir una vida mejor. Chile está lleno de extranjeros que madrugan, pagan impuestos y sostienen familias con enorme esfuerzo. El problema es la inmigración ilegal descontrolada y la incapacidad del Estado para poner límites claros.

Porque cuando el Estado pierde el control, los primeros perjudicados son precisamente los vecinos más vulnerables: familias trabajadoras que deben convivir con campamentos sin urbanización, Micro basurales, plagas de ratones, comercio informal fuera de norma, música a altas horas de la madrugada, inseguridad y una sensación permanente de abandono. Eso no es xenofobia. Eso es realidad.

Negar ese malestar ciudadano solo alimenta más rabia y más polarización. Pero también es irresponsable utilizar ese dolor social prometiendo soluciones espectaculares que después terminan convertidas en explicaciones literarias. Ahí está la verdadera falta de respeto.

Porque mientras las personas esperan recuperar seguridad, orden y tranquilidad en sus barrios, el gobierno responde con piruetas discursivas.

El Kast candidato se presentaba como el enemigo de “la elite política mentirosa”. Prometía hablar siempre “sin complejos” y “con la verdad”. Pero hoy termina usando exactamente las mismas maniobras que criticaba: reinterpretar promesas, culpar a la ciudadanía por entender literalmente lo que él dijo y disfrazar incumplimientos con retórica.

Al final, el outsider terminó pareciéndose demasiado a la vieja política que juró destruir. Solo que con más marketing y menos autocrítica. Y quizás por eso esta polémica golpeó tan fuerte. Porque toca algo profundo: la sensación de que la política chilena se transformó en una competencia de frases efectistas donde ganar importa más que decir la verdad.

Pero gobernar no es escribir consignas. Gobernarnier no es improvisar metáforas. Gobernar no es poetizar promesas imposibles frente a un país cansado de la inseguridad, del abandono y de políticos que ofrecen soluciones mágicas para después esconderse detrás de las palabras.

Chile merece algo mejor. Merece autoridades que hablen claro, incluso cuando la verdad sea incómoda. Merece liderazgo sin teatro. Convicciones sin caricaturas. Autoridad sin humo.

Porque un país no se gobierna con metáforas. Y mucho menos con poemas electorales escritos para conquistar votos mientras miles de familias siguen esperando algo mucho más simple: poder vivir tranquilas en sus barrios.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&q=80",
    status: "published",
    tags: ["Kast", "Migración", "Política Pública", "Discurso Electoral"],
    authorId: "user-ruben-oyarzo",
    authorName: "Rubén Oyarzo",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    createdAt: "2026-06-12T08:00:00Z",
    updatedAt: "2026-06-12T08:00:00Z",
    views: 0
  },
  {
    id: "art-5",
    title: "Conchalí: Más barato es cerrar que leer",
    subtitle: "El abandono de la biblioteca pública de Conchalí por casi dos años y la postergación cultural municipal.",
    content: `Conchalí: Más barato es cerrar que leer

Por Nicolas Aguilera, Licenciado en Lengua y Literatura.
Columna para El Conchalino

Como vecino de Conchalí, me cuesta no preguntarme en qué momento leer se volvió un lujo. Lo digo después de leer la encuesta de hábitos lectores publicada por La Tercera que muestra que la mayoría de las personas en Chile lee uno o dos libros al año y que el precio es el principal obstáculo. Muchos podrían pensar que la falta de interés es el problema, pero solo hay que mirar lo que pasa en nuestra comuna para entender todo.

En Conchalí, la biblioteca comunal está por cumplir dos años cerrada. Dos años sin un espacio público para leer, estudiar, encontrarse o simplemente estar. Lo que se anunció como un cierre temporal terminó transformándose en una ausencia prolongada, sin una transparencia de información, fechas y respuestas.

No se trata solo de libros. Una biblioteca es un lugar donde los estudiantes pueden cumplir con sus lecturas escolares, donde los adultos pueden acceder a textos sin tener que comprarlos, donde se pueden hacer talleres, clubes de lectura y el encuentro de personas. Cuando ese espacio desaparece, lo que se pierde es un servicio y una oportunidad. Porque si consideramos que el 69% de las personas encuentra los libros caros, cerrar una biblioteca significa eliminar la principal alternativa gratuita de acceso a la lectura. En ese escenario, leer deja de ser un derecho y pasa a ser un privilegio económico.

A esto se suma otro problema que como vecinos no podemos ignorar: la falta de transparencia. La licitación para reparar la cubierta del edificio, identificada como ID 2581-57-LP24, tenía un plazo de sesenta días corridos, lo que permitía proyectar una reapertura hacia mayo de 2025. Sin embargo, hasta hoy no hay información pública clara sobre el avance de las obras, ni sobre el uso de los recursos, que superan los cincuenta millones de pesos. Lo único que hemos visto ha sido una gigantografía con fechas que duró un par de semanas.

También se ha intentado compensar esta ausencia con iniciativas como la llamada “biblioteca de bolsillo” en dependencias municipales o con publicaciones en redes sociales. Y se agradece, pero eso no reemplaza una biblioteca abierta, viva y disponible para la comunidad. No es lo mismo.

Se podrá decir que el cierre era necesario, que el edificio no estaba en condiciones o que la asistencia era baja. Y tienen razón en parte, pero incluso si ese fuera el caso, lo que no se entiende es por qué la solución ha sido el silencio y la demora. Si un espacio no estaba funcionando bien, lo lógico sería mejorarlo, no dejarlo cerrado.

Lo mismo ocurre con la celebración del Día del Libro. En la práctica, se ha reducido a recomendaciones en redes sociales y al apoyo de actividades en colegios. No está mal, pero es insuficiente. Da la sensación de que se cumple con la fecha, pero no con el fondo. Se habla de lectura, pero no se generan condiciones reales para fomentarla.

Y aquí es donde creo que está el punto más importante. El municipio no puede limitarse a acciones simbólicas. Su rol es asegurar que existan espacios y oportunidades reales para que la lectura sea parte de la vida cotidiana de la comunidad. Más aún cuando existe una biblioteca que podría cumplir ese papel y que hoy está cerrada.

Como vecinos de Conchalí, desde hace más de 10 años, no estoy pidiendo algo extraordinario. Estoy molestando por lo básico: acceso, información y compromiso. Queremos saber qué pasó con los recursos, cuáles son los plazos reales y cuándo podremos volver a contar con nuestra biblioteca.

Porque leer no es solo una decisión personal. Es una posibilidad que depende de las condiciones que se nos entregan. Y cuando esas condiciones no existen, no es la gente la que falla. Es el sistema el que no está funcionando como debería.`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80",
    status: "published",
    tags: ["Conchalí", "Bibliotecas", "Cultura", "Transparencia"],
    authorId: "user-nicolas-aguilera",
    authorName: "Nicolas Aguilera",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
    createdAt: "2026-06-12T15:00:00Z",
    updatedAt: "2026-06-12T15:00:00Z",
    views: 0
  },
  {
    id: "art-6",
    title: "Kast mira a Milei: del ajuste al plato y la carne de burro como advertencia",
    subtitle: "El peligro en la importación acrítica del modelo de motosierra fiscal y desregulación económica extrema.",
    content: `Kast mira a Milei: del ajuste al plato y la carne de burro como advertencia

Por Rubén Oyarzo, Magíster en Instituciones Políticas Públicas
Columna para Biobio.cl

La derecha chilena vuelve a ofrecernos su receta de siempre, aunque ahora venga envuelta en un nuevo papel de regalo. Nos hablan de modernidad, de crecimiento, de libertad, de eficiencia. Nos prometen un país donde el mérito lo será todo y donde el Estado, reducido a su mínima expresión, dejará de ser —según ellos— un freno para el desarrollo. Suena atractivo, por supuesto. Pero cuando uno mira con atención quiénes son sus referentes y qué modelo quieren importar, la preocupación no tarda en aparecer.

Porque José Antonio Kast no ha escondido su admiración por Javier Milei. Al contrario, la ha expresado con entusiasmo. Ve en el mandatario argentino una inspiración política, un ejemplo de cómo aplicar reformas profundas, rápidas y sin contemplaciones. La famosa motosierra no solo se ha convertido en un símbolo en Argentina; también seduce a sectores de la derecha chilena que sueñan con replicar aquí esa misma lógica de ajuste extremo.

Y ahí es donde debemos detenernos a reflexionar. Porque detrás de la retórica de la libertad económica y del discurso de la eficiencia, lo que estamos viendo en Argentina es una realidad compleja, dura y profundamente humana. Las cifras pueden ser discutidas en seminarios o en paneles de televisión, pero la vida cotidiana no se mide en gráficos. Se mide en la mesa de una familia, en el bolsillo de un trabajador, en la tranquilidad de un jubilado, en la posibilidad de proyectar el futuro.

Cuando el salario alcanza cada vez menos, cuando los precios suben más rápido que los ingresos y cuando la incertidumbre se instala como compañera permanente, la libertad deja de sentirse como una conquista. Se convierte en una palabra bonita, pero vacía, para quienes están demasiado ocupados tratando de llegar a fin de mes.

Y es precisamente ahí donde surge una metáfora que golpea con fuerza: la de terminar “comiendo carne de burro”. No es una frase literal ni una exageración gratuita. Es la imagen de una sociedad que, poco a poco, va normalizando la precariedad. De familias que deben reemplazar lo que antes era básico por lo que simplemente alcanza. De personas que ajustan sus expectativas, que resignan calidad de vida, que aprenden a conformarse con menos.

Eso es lo que ocurre cuando las políticas de shock se aplican sin considerar sus efectos sociales. El costo rara vez lo pagan quienes diseñan las reformas desde la comodidad de sus oficinas. Lo pagan los trabajadores, los jubilados, la clase media, los pequeños emprendedores, las familias que ven cómo cada día cuesta un poco más sostener la vida que habían construido con esfuerzo.

Porque esa es la gran trampa de las reformas extras: prometen prosperidad general, pero muchas veces terminan distribuyendo sacrificios entre las mayorías, mientras los beneficios se concentran en unos pocos. Socializan los costos y privatizan las ganancias.

Y en Chile debemos estar atentos. Porque cuando algunos sectores miran a Argentina con admiración, no solo están observando una estrategia económica. Están abrazando una visión de sociedad donde el mercado ocupa el centro y donde los derechos sociales pasan a un segundo plano. Una visión donde la desigualdad parece tolerable, siempre y cuando las cifras macroeconómicas luccan ordenadas.

Pero un país no puede evaluarse solo por sus indicadores. Un país se mide por la calidad de vida de su gente. Por la seguridad de saber que una enfermedad no significará la ruina. Por la certeza de que el esfuerzo tendrá recompensa. Por la tranquilidad de envejecer con dignidad. Por la posibilidad de que nuestros hijos vivan mejor que nosotros.

Chile necesita crecer, sin duda. Necesita recuperar dinamismo, generar empleo, impulsar la inversión y abrir nuevas oportunidades. Pero ese crecimiento debe ir de la mano con la justicia social, con la cohesión y con la protección de las personas. No puede construirse sobre la base de la incertidumbre permanente ni del debilitamiento de las redes que sostienen a las familias.

La verdadera libertad no consiste solo en reducir impuestos o eliminar regulaciones. La verdadera libertad es poder vivir sin miedo. Sin miedo a enfermarse, a perder el empleo, a no poder pagar la educación de los hijos o a enfrentar la vejez en soledad.

Por eso, cuando la derecha chilena nos presenta a Milei como un modelo a seguir, es legítimo preguntarse si están dispuestos a asumir también el costo humano de ese camino. Porque gobernar no es aplicar teorías en un laboratorio. Gobernar es hacerse cargo de la realidad concreta de millones de personas.

Chile merece un debate serio, responsable y profundamente humano. Uno que ponga en el centro a las personas y no a las ideologías. Uno que entienda que el desarrollo no se trata solo de números, sino de dignidad, bienestar y esperanza.

Porque el progreso real no se mide en balances ni en eslóganes. Se mide en mesas llenas, en hogares tranquilos y en familias que pueden mirar el futuro con confianza. Y si el camino que algunos proponen termina obligando a las mayorías a resignarse, a aceptar la precariedad como norma y a conformarse con menos, entonces no estamos hablando de libertad ni de modernidad. Estamos hablando, simplemente, de una advertencia. Y Chile merece mucho más que eso. Porque un país no se construye sobre el sacrificio de las mayorías para beneficio de unos pocos. Se construye con dignidad, justicia y oportunidades para todos. De lo contrario, mientras nos prometen prosperidad, podríamos terminar comiendo carne de burro.`,
    category: "Geopolítica Económica",
    imageUrl: "https://images.unsplash.com/photo-1622126131411-cf0b9cf6fd0b?w=600&q=80",
    status: "published",
    tags: ["Milei", "Kast", "Macroeconomía", "América Latina", "Ajuste Fiscal"],
    authorId: "user-ruben-oyarzo",
    authorName: "Rubén Oyarzo",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    createdAt: "2026-06-13T10:00:00Z",
    updatedAt: "2026-06-13T10:00:00Z",
    views: 0
  },
  {
    id: "art-7",
    title: "La promesa del 1%",
    subtitle: "¿Por qué el financiamiento a ciencia y tecnología sigue atrapado en la retórica de campañas electorales?",
    content: `La promesa del 1%

Por Felipe Valenzuela Escobar, Presidente Nacional - Juventud Liberal de Chile.
Columna escrita para El Desconcierto.

La historia reciente de Chile parece escrita con tinta de promesas y márgenes de olvido. ¿Si existe consenso político en torno a la ciencia, por qué ningún gobierno ha alcanzado el anhelado 1% del PIB en investigación y desarrollo? ¿Se trata de una limitación fiscal real o de una falta de prioridad política? ¿Es esta meta un compromiso serio o apenas un recurso retórico de campaña? Durante el segundo gobierno de Sebastián Piñera, la creación del Ministerio de Ciencia, Tecnología, Conocimiento e Innovación marcó un hito institucional que encendió la esperanza de una política de Estado basada en el conocimiento. Sin embargo, aquella conquista quedó suspendida entre la voluntad simbólica y la cautela presupuestaria, como un fanal atenuando la luz que dará rumbo al arribo.

La promesa del 1% se transformó entonces en un credo transversal, repetido con devoción en cada contienda electoral y reafirmado por el gobierno de Gabriel Boric. Desde la derecha liberal hasta la izquierda progresista, todos coincidieron en que sin ciencia no hay desarrollo ni soberanía. Pero la reiteración del compromiso no logró romper la inercia histórica: la meta se mantuvo como horizonte aspiracional más que como destino político. Así, Chile continúa atrapado en la paradoja de proclamar su fe en el conocimiento mientras posterga el diezmo del diezmo, celebrando el progreso en el discurso y relegándolo en la práctica.

Hoy, el debate adquiere un tono más inquietante ante los recortes en becas de la Agencia Nacional de Investigación y Desarrollo (ANID) bajo el gobierno de José Antonio Kast. Reducir el apoyo a la formación de capital humano avanzado no es solo un ajuste contable, es una renuncia al futuro. Es hipotecar la innovación, debilitar la soberanía intelectual y condenar al país a la dependencia tecnológica histórica del sur global. Porque cuando se recorta la ciencia, no se ahorran recursos, se empobrece el porvenir. Y una nación que escatima en conocimiento no solo retrasa su desarrollo: abdica de él.

No son los genios consagrados de Chile a quienes golpean estas medidas, sino a los genios ocultos en las poblaciones, aquellos cuyo talento lucha por abrirse paso entre la precariedad y el olvido. En un país de cunas de oro y de mimbre, recortar las becas ANID es despojar de almohadas que concilien el sueño de un futuro donde florezca el mérito. Es arrebatar la posibilidad de que la inteligencia venza al privilegio y de que el esfuerzo supere al origen.

Aumentar el presupuesto en ciencia no es un capricho tecnocrático, sino un acto de justicia social: democratizar el conocimiento para que la excelencia no sea patrimonio de una élite. Porque el verdadero progreso consiste en garantizar que los doctores de nuestra patria se apelliden tanto Altman como Valenzuela. Solo entonces la ciencia dejará de ser un privilegio y se convertirá en un derecho; solo entonces el talento será más fuerte que la cuna y el mérito más poderoso que la herencia.

Que no se diga progresista quien no apoyó el progreso; que no se diga patriota quien no defendió a su pueblo. El anhelado 1% quedó en mera promesa: palos y bizcochuelos para la gente. Mientras el mundo avanza hacia la economía de los saberes, Chile permanece anclado en tiempos portalianos, donde el orden se impone sobre el desarrollo.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&q=80",
    status: "published",
    tags: ["Ciencia", "Presupuesto", "ANID", "Desarrollo", "Juventud"],
    authorId: "user-felipe-valenzuela",
    authorName: "Felipe Valenzuela Escobar",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    createdAt: "2026-06-13T12:00:00Z",
    updatedAt: "2026-06-13T12:00:00Z",
    views: 0
  },
  {
    id: "art-8",
    title: "El modelo Piñera",
    subtitle: "Reflexión económica y política sobre el legado de Sebastián Piñera tras la controvertida revelación de Bachelet.",
    content: `El modelo Piñera

Por Fernando Claro, economista y Director Ejecutivo de la FPP
Columna para La Segunda

La expresidenta Bachelet reveló una infidencia: el presidente Piñera le habría propuesto, hace años, que se postulara a la Secretaría General de la ONU. Ella se habría mostrado sorprendida, nunca habría pensado ostentar semejante puesto —glamoroso e inútil en sus objetivos oficiales—, pero el presidente le insistió, e incluso le dijo que la apoyaría. Bachelet dice esto, obvio, para utilizar la imagen y legitimidad del difunto presidente, que no ha dejado de crecer después de su muerte. Su idea es contrastar esa legitimidad con la del presidente Kast, quien no la apoyará y representaría lo peor —algo similar han hecho políticos de derecha con falta de autoestima—. Piñera la habría apoyado porque es una política de Estado, arguyen. ¿Cómo va a ser una política de Estado si ella, y Boric, hicieron todo, pero todo, para que no lo fuera?

Dieron paso tras paso para que fuera una simple movida ideológica, de gobierno, quizás solo para dejarle una incomodidad a quienes los sucedían gobernando. Lo urdieron a escondidas, sin conversar, y de repente lo anunciaron, pero luego, también a escondidas, lo firmaron junto a Lula y Sheinbaum, dos presidentes que han apoyado a Maduro sin vergüenza. ¿Qué les ocurrirá a esos políticos de derecha que también querrían apoyarla o utilizan a Piñera para lo mismo?

Bachelet hace esto a pesar de que ella, justamente a cargo de los Derechos Humanos en la ONU, hizo poco para frenar el espiral de violencia que destruía Chile durante 2019, cuando Piñera era presidente. De hecho su informe dejó muchas ambigüedades, lo que fue criticado por el mismo presidente Piñera —a diferencia del de Human Rights Watch—. Bachelet, además, no hizo poco, sino que nada, pero absolutamente nada, para defender a Piñera de las viles acusaciones de antidemocrático, asesino y dictador que le hicieron, no solo en 2019, sino que después, durante la pandemia. ¿Cómo tiene la desvergüenza ahora de utilizar a Piñera después de todo eso?

Una cosa es demostrar respeto y condolencias cuando el expresidente murió; otra, muy diferente, es, después de todo esto, utilizar su nombre como modelo de gobernante. No sólo se lo denostó, sino que se lo dejó solo —igual que muchos políticos de derecha— cuando no había hecho absolutamente nada para merecerlo.

Venir ahora a utilizarlo demuestra lo falso de las acusaciones, lo decadente de nuestros líderes, y la total desvergüenza de la izquierda. Esa misma izquierda que apoyando a Kirchner y Chávez demuestra ser capaz de todo por el poder. ¿No se nota algo similar estos días con la histeria contra un gobierno que ni cumple un mes? ¿Tan malo es Kast, como fue Piñera en su momento? Pregunto para entenderlos. Y sería bueno que varios de derecha, especialmente los que andan confundidos con el gobierno de Kast, se dieran cuenta.`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&q=80",
    status: "published",
    tags: ["Piñera", "Bachelet", "FPP", "Derecha", "Historia", "Centro"],
    authorId: "user-fernando-claro",
    authorName: "Fernando Claro",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
    createdAt: "2026-06-13T15:00:00Z",
    updatedAt: "2026-06-13T15:00:00Z",
    views: 0
  },
  {
    id: "art-9",
    title: "Acuso de dolo. La construcción política de la escasez fiscal en Chile.",
    subtitle: "Un exhaustivo análisis crítico del relato oficial de austeridad presupuestaria y caja fiscal.",
    content: `Acuso de dolo. La construcción política de la escasez fiscal en Chile: entre relato económico y decisión ideológica

Por José Cáceres S., cientista político y adm. Público.
Columna para Le Monde Diplomatique edición chilena.

En el reciente debate público chileno, la afirmación de que “no hay plata” ha vuelto a instalarse como una verdad aparentemente incuestionable. Desde el Ministerio de Hacienda se ha sostenido que la disponibilidad fiscal es limitada —aludiendo a cifras cercanas a los 46 millones de dólares hacia fines de 2025— configurando así un escenario de restricción presupuestaria que justificaría la contención del gasto público. Este diagnóstico ha sido reiterado por el actual ministro de Hacienda, Jorge Quiroz, quien ha enfatizado la necesidad de mantener una disciplina fiscal y orden en las cuentas públicas, señalando que “vamos a hacer lo necesario para recuperar el crecimiento” y defendiendo la pertinencia de ajustes en el gasto en función de la sostenibilidad fiscal (La Tercera, 2026; Bloomberg Línea, 2026). Este tipo de afirmaciones se repiten de manera constante por diversos actores políticos y mediáticos, configurando un relato de restricción estructural y una percepción difusa en la ciudadanía.

Sin embargo, esta narrativa entra en tensión con otros antecedentes posteriores que se comienzan a identificar: al iniciar el año 2026, los niveles de disponibilidad fiscal superaban ampliamente los 1.400 millones de dólares, de acuerdo con reportes de ejecución presupuestaria y cobertura en prensa económica nacional (Diario Financiero, 2026; La Tercera, 2026). Esta discrepancia no puede ser leída únicamente como un desfase técnico o contable, sino como una señal de inconsistencia entre el discurso político y la realidad fiscal efectiva.

A esta construcción discursiva se suma el posicionamiento del actual presidente de la República, José Antonio Kast, quien ha insistido en que Chile enfrenta un escenario económico complejo, subrayando la necesidad de “ordenar la casa” y reforzar la responsabilidad fiscal como eje de su programa económico (Emol, 2026; El País, 2026). Así, se configura un consenso discursivo que, más que describir la realidad, tiende a producirla.

La pregunta que emerge, entonces, no es simplemente económica, sino profundamente política: ¿se trata de una mala lectura de las finanzas públicas o de la construcción deliberada e interesada de un relato de escasez? Este texto sostiene que la insistencia en la idea de crisis fiscal en un escenario de disponibilidad efectiva de recursos constituye una forma de producción política de la realidad económica, donde el discurso no describe la situación, sino que la orienta.

Sosteniendo la teoría

La clase en el poder tiende a proteger sus privilegios, reforzando y defendiendo —por distintos medios— el dominio que ejerce sobre otras clases sociales. Como ya advertían Karl Marx y Friedrich Engels, “las ideas de la clase dominante son, en cada época, las ideas dominantes”, en tanto “la clase que dispone de los medios de producción material dispone también de los medios de producción espiritual” (Marx & Engels, 1974, p. 50). La historia ha mostrado de manera consistente este comportamiento.

En el contexto actual, esta lógica se expresa en la construcción de un relato de crisis que presenta al país en una situación de catástrofe económica, atribuyendo responsabilidades al gobierno anterior, el cual, más allá de sus definiciones ideológicas, operó dentro de los márgenes estructurales del poder existente.

Expresiones como “no hay plata”, “gobierno de emergencia” o “el país está quebrado” se reiteran en el discurso público, configurando una narrativa que, más que describir la realidad, contribuye a producirla. A través de su circulación mediática, estas ideas se instalan en la opinión pública, orientando percepciones y condicionando la comprensión social de la situación económica.

Lo anterior adquiere mayor relevancia cuando los medios de comunicación son controlados por grupos que forman parte de la misma élite económica. En esta línea, Jürgen Habermas advierte que la opinión pública puede transformarse en un espacio donde intereses particulares se presentan como universales, señalando que “la opinión pública se convierte en una esfera en la que se despliegan intereses privados que se presentan como si fueran de interés general” (Habermas, 1981, p. 182).

Hegemonía, economía y construcción de la realidad fiscal

Para comprender la dimensión política del discurso fiscal contemporáneo, resulta fundamental recurrir a la teoría de la hegemonía desarrollada por Antonio Gramsci en sus Cuadernos de la cárcel. En esta perspectiva, el poder no se ejerce exclusivamente a través de mecanismos coercitivos, sino también mediante la construcción de consenso social.

Parafraseando a Gramsci, puede sostenerse que la clase social en el poder no se limita sólo al dominio material, sino que interviene de manera encubierta en el comportamiento sociocultural de las masas: “la supremacía de un grupo social se manifiesta de dos maneras, como dominio y como dirección intelectual y moral” (Gramsci, 1975, p. 70).

Este planteamiento permite entender que el poder se consolida cuando una determinada visión del mundo logra instalarse como sentido común. En este marco, la economía deja de ser un ámbito puramente técnico y se convierte en un espacio de disputa ideológica.

Desde esta perspectiva, el discurso de la escasez fiscal puede ser interpretado como un dispositivo hegemónico. No se trata únicamente de una descripción de la situación financiera del Estado, sino de una construcción discursiva que delimita lo posible en términos de política pública. En consecuencia, la construcción de la escasez fiscal no puede ser entendida únicamente como un error técnico, sino como parte de una estrategia de dirección política (Gramsci, 1975, p. 70).

La caja fiscal: una explicación necesaria

Para comprender el problema, es fundamental aclarar qué se entiende por “caja fiscal”. En términos simples, la caja fiscal corresponde al conjunto de recursos líquidos disponibles que posee el Estado en un momento determinado para cumplir con sus obligaciones y ejecutar políticas públicas. A diferencia del presupuesto —que proyecta ingresos y gastos— la caja fiscal refleja la disponibilidad efectiva de dinero, considerando ingresos tributarios, endeudamiento y movimientos financieros de corto plazo.

En economías modernas, la gestión de caja no implica una simple contabilidad estática, sino una administración de flujos. Tal como señala el Fondo Monetario Internacional (FMI, 2016), la gestión de tesorería pública busca “asegurar que el gobierno disponga de liquidez suficiente para cumplir sus obligaciones, minimizando costos y riesgos”. En este sentido, la existencia de bajos niveles de caja en un momento específico (como diciembre, tras el cierre presupuestario) no constituye evidencia de insolvencia estructural, sino una condición temporal del ciclo fiscal. Por ello, presentar una cifra puntual como expresión de una crisis económica generalizada constituye una distorsión políticamente funcional.

El relato de la escasez como instrumento político

La literatura económica ha advertido reiteradamente sobre el uso político del discurso fiscal. Así lo manifiesta el economista Abba Lerner, quien desde la teoría de las finanzas funcionales (1943) sostiene que el gasto público no debe evaluarse en función de equilibrios contables inmediatos, sino de sus efectos en el empleo, la producción y el bienestar social. En esta línea, el énfasis en la “restricción fiscal” puede convertirse en un mecanismo para limitar la acción del Estado más allá de lo estrictamente necesario. Vale decir, es limitar la acción del Estado en cuanto a la inversión social, conocida como “gasto social” desde la estructura capitalista presente.

Más recientemente, el economista Stephanie Kelton (2020) ha cuestionado la narrativa de la escasez en Estados con capacidad de emisión y financiamiento, argumentando que “el verdadero límite del gasto público no es el dinero, sino la capacidad productiva de la economía”. Desde esta perspectiva, insistir en la falta de recursos cuando existen márgenes fiscales disponibles responde mucho menos a una realidad económica y mucho más a una posición política.

Desde visiones de Joseph Stiglitz (Premio Nobel de Economía, 2001), se reconoce que los mercados y los discursos económicos no son neutrales. Stiglitz advierte que las políticas fiscales restrictivas pueden ser justificadas mediante narrativas que invisibilizan sus efectos sociales, señalando que “la austeridad no es solo una política económica, sino una elección política que distribuye costos y beneficios de manera desigual” (Stiglitz, 2012).

Verdad económica y poder: una lectura crítica

La construcción de una supuesta crisis fiscal en contextos de disponibilidad de recursos puede entenderse, entonces, como una forma de ejercicio del poder. No se trata únicamente de cifras, sino de la capacidad de definir qué es considerado real y qué no. En este sentido, la economía se aproxima a lo que Michel Foucault denominó un “régimen de verdad”: un conjunto de discursos que, legitimados institucionalmente, determinan lo que se acepta como verdadero en una sociedad (Foucault, 1977).

Desde esta perspectiva, afirmar que “no hay plata” no es solo una descripción, sino un acto performativo que produce efectos concretos, como la contención del gasto social, la postergación de reformas o la deslegitimación de demandas ciudadanas. La escasez deja de ser un dato y se convierte en un dispositivo de gobierno.

En el contexto chileno reciente, esta lógica se ve reforzada por la convergencia entre discurso técnico y posicionamiento político, donde la reiteración mediática de la crisis contribuye a consolidar una percepción de inevitabilidad. Tal como plantea David Harvey (2014), las crisis económicas y sus narrativas asociadas suelen ser utilizadas para reconfigurar las relaciones entre Estado, mercado y sociedad, consolidando modelos que priorizan la disciplina fiscal por sobre la equidad social.

Conclusión

A la luz de lo expuesto, la discrepancia entre el discurso de escasez fiscal y la existencia efectiva de recursos no puede ser interpretada como un simple error técnico. Cuando la información disponible permite prever que la situación financiera es más holgada de lo que se declara, insistir en un relato de crisis configura una forma de responsabilidad política que trasciende la negligencia. “Acuso de dolo” no es aquí una imputación jurídica, sino una categoría analítica: en tanto señala que las decisiones y discursos económicos no son inocentes, sino orientados a producir determinados efectos. En este caso, la instalación de una crisis fiscal inexistente o sobredimensionada opera como justificación para limitar la acción del Estado y redefinir las prioridades del gasto público.

En última instancia, el problema no es solo cuánto dinero tiene el Estado, sino quién define qué se puede hacer con él. Y esa, más que una cuestión económica, es una pregunta profundamente política.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80",
    status: "published",
    tags: ["Hacienda", "Macroeconomía", "Gramsci", "Foucault", "Austeridad"],
    authorId: "user-jose-caceres",
    authorName: "José Cáceres S.",
    authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80",
    createdAt: "2026-06-14T08:00:00Z",
    updatedAt: "2026-06-14T08:00:00Z",
    views: 0
  },
  {
    id: "art-10",
    title: "Migración al aula: una oportunidad para educar en ciudadanía democrática",
    subtitle: "Frente a discursos de criminalización y zanjas en el norte, la sala de clase surge como el laboratorio del pluralismo.",
    content: `Migración al aula: una oportunidad para educar en ciudadanía democrática

Por Javier Pascual (Momento Ciudadano), Constanza Ayala (Universidad de Valparaíso), Catalina Miranda (Momento Ciudadano) y Ruth Aguirre (Universidad de Valparaíso)
Columna para el repositorio Columna Pública.

La política internacional no nos ha sido indiferente este año. Las múltiples crisis políticas, sociales y bélicas han resonado con fuerza en Latinoamérica y, por supuesto, en los hogares de miles de familias migrantes en Chile. Para muchos niños, niñas y jóvenes, estos no son solo noticias: son eventos que afectan a sus familias y a los amigos que dejaron atrás. Esta sensación se intensifica observando, por ejemplo, acciones como las de ICE en Estados Unidos o la detención de Nicolás Maduro, que han tensado aún más la relación de este país con su población migrante.

Mientras tanto, en el norte de Chile se comienza a construir una zanja para frenar la inmigración por pasos no habilitados, mientras que en el Congreso avanza un proyecto de ley que restringe el acceso de inmigrantes en situación irregular a beneficios sociales. Este es un contexto que posiciona a las personas migrantes como un “problema” del cual hay que hacerse cargo, deshumanizándolas en el proceso.

Las escuelas no son un espacio impermeable a este contexto. En un sistema escolar donde casi uno de cada diez estudiantes es inmigrante, los establecimientos pueden ver manifestadas las tensiones en el patio, en la sala de clases y en las conversaciones entre estudiantes. La profunda polarización política —con sus posiciones irreconciliables sobre los eventos antes descritos— puede perfectamente replicarse en la escuela, generando conflictos, exclusiones o silencios forzados.

Pero esta complejidad no debe verse como un problema a evitar, sino como el objeto mismo de la educación ciudadana. Las escuelas tienen la oportunidad histórica de modelar lo que significa convivir democráticamente en medio de diferencias políticas profundas y contextos socioculturalmente diversos. Para este fin, se hace necesario crear espacios donde estudiantes migrantes puedan expresar sus preocupaciones sin prejuicios, y donde todos y todas puedan aprender que el disenso político no cancela la dignidad humana ni los vínculos comunitarios.

Desde la investigación académica se identifican principalmente cuatro enfoques pedagógicos que pueden ser útiles para abordar esta coyuntura.

Primero, la educación intercultural crítica, que implica cuestionar las relaciones de poder que perpetúan desigualdades, valorar los conocimientos y experiencias que aportan los estudiantes migrantes, y construir una comunidad escolar donde la diversidad cultural no sea un problema a resolver, sino una fuente de enriquecimiento mutuo y aprendizaje democrático.

Segundo, la educación en Derechos Humanos, especialmente respecto al derecho a la participación política, a la libertad de expresión y al debido proceso, pero también al derecho a migrar y a ser acogido con dignidad. Formar en esta materia es ayudar a que niños, niñas y jóvenes se reconozcan como sujetos de derechos y como responsables de defenderlos en sus propias comunidades.

Tercero, educar desde la controversia, ya que, lejos de ser un obstáculo, es una oportunidad para que los estudiantes aprendan a sostener desacuerdos sin violencia, a fundamentar posiciones con evidencia y a reconocer la complejidad inherente a los procesos políticos.

Por último, la pedagogía de la memoria. Conectar lo que ocurre ahora con procesos históricos, incluida nuestra propia experiencia como país, permite al estudiantado comprender que la democracia es frágil, que requiere cuidado constante y que todas las personas son parte de su construcción, invitando a reconocer las memorias múltiples que conviven en el aula y valorando las experiencias de quienes han vivido exilios, represiones o pérdidas de derechos.

La Ley 20.911, piedra angular de la educación ciudadana en el sistema educativo, plantea que los establecimientos deben promover \"la valoración de la diversidad social y cultural del país\" y formar \"estudiantes capaces de ejercer una ciudadanía activa, democrática y solidaria\". Por eso, la pregunta no es si abordar la contingencia, sino cómo hacerlo de manera que fortalezca la convivencia democrática, desarrolle pensamiento crítico y forme ciudadanos comprometidos con los derechos humanos.

Las escuelas chilenas tienen hoy una oportunidad pedagógica excepcional para lograrlo. Ojalá sepamos aprovecharla.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    status: "published",
    tags: ["Educación", "Migración", "Derechos Humanos", "Interculturalidad", "Ley 20911"],
    authorId: "user-javier-pascual",
    authorName: "Javier Pascual",
    authorAvatar: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=300&q=80",
    createdAt: "2026-06-14T09:00:00Z",
    updatedAt: "2026-06-14T09:00:00Z",
    views: 0
  },
  {
    id: "art-11",
    title: "La postcampaña: cuando la entrevista se convierte en marketing",
    subtitle: "Crítica de medios a la entrevista de José Antonio Kast en 'Las Caras de la Moneda' y el retroceso de la interpelación fiscal.",
    content: `La postcampaña: cuando la entrevista se convierte en marketing

Por Camilo Carrera Orellana, director Eco Glocal Media
Columna para Comentario Público

Hace poco más de 90 horas, mediante una transmisión multiplataforma —que incluyó televisión abierta, cable y streaming vía YouTube— se emitió el último capítulo de la quinta temporada de Las Caras de la Moneda, un programa que, desde 2009, ha acompañado al electorado chileno entrevistando a buena parte de quienes han aspirado a la Presidencia de la República.

El espacio ha sido liderado desde sus inicios por el histórico conductor Mario Kreutzberger, figura ampliamente reconocida en el ecosistema mediático nacional e internacional. Diversas voces lo han posicionado como un referente en la entrevista política de corte ciudadano: un formato que, en teoría, rompe protocolos, interpela sin temor y formula aquellas preguntas que la audiencia espera escuchar. O al menos, eso se supone.

Sin embargo, algo parece haberse desdibujado en el tiempo. Quizás se trata del desgaste natural de un formato que alguna vez fue innovador; o tal vez influye un elemento más incómodo de reconocer: la cercanía entre entrevistador y entrevistado. Porque el invitado de este último capítulo no fue cualquier figura, sino el recientemente asumido presidente de la República de Chile, José Antonio Kast, exmilitante republicano y conocido por su histórica defensa del régimen de Augusto Pinochet.

Conviene aclararlo desde el inicio: no hay objeción a la entrevista en sí. Por el contrario, las primeras conversaciones con un mandatario recién asumido son fundamentales. Permiten delinear prioridades, anticipar decisiones y comprender el rumbo político que marcará los próximos cuatro años. Eso —y no otra cosa— era lo esperable de una instancia como esta.

Pero lo que se ofreció estuvo lejos de cumplir con ese estándar. Los temas de Estado, aquellos que estructuran el debate público y condicionan la vida de millones, fueron prácticamente inexistentes. En su lugar, el programa dedicó extensos segmentos a construir una imagen íntima y favorable del presidente. Se entrevistó a su hijo para destacar su rol como padre; a su esposa, para subrayar su faceta de marido; y a su asesora del hogar, para reforzar su carácter como amable empleador.

A esto se sumaron amigos cercanos que, previsiblemente, abundaron en elogios sobre su calidad humana y sus virtudes personales.

El despliegue no terminó ahí. Se incorporaron recursos de inteligencia artificial para recrear escenas ficticias del mandatario en contextos cotidianos: eligiendo corbatas, ejercitándose en un gimnasio, compartiendo con la primera dama o incluso realizando un asado en La Moneda. Una puesta en escena que, más que aportar contenido, reforzó la sensación de estar frente a una pieza de construcción de imagen antes que a una entrevista de interés público.

Es cierto: hubo algunas preguntas relevantes. En un momento, el conductor abordó declaraciones pasadas de Kast en las que describía un país “que se cae a pedazos”. La respuesta del presidente fue, por decir lo menos, superficial: argumentó que esa percepción se evidenciaba en grafitis visibles en el centro de Santiago o en los “eventos” camino al aeropuerto. Y ahí quedó todo. Sin contrapregunta. Sin profundización. Sin tensión.

Ahora bien, algunos podrían argumentar que la vasta experiencia del presidente José Antonio Kast en este tipo de instancias le otorgó las herramientas necesarias para salir relativamente ileso de la entrevista. Es una hipótesis plausible. Pero, de ser así, lo mínimo exigible sería que el contrapeso proviniera del periodismo. Y eso, sencillamente, no ocurrió.

Un ejemplo evidente fue la conversación con la primera dama, Pía Adriasola, cuya presencia en el programa fue extensa y, en teoría, una oportunidad para profundizar en su eventual rol público. Se le consultó —correctamente— cuál sería su sello en el ejercicio de sus funciones, incluso entregándole un marco de referencia concreto: iniciativas como Elige Vivir Sano, impulsada en su momento por la ex primera dama Cecilia Morel.

La respuesta fue tan breve como reveladora: “abrazar a la gente”. Ese fue el nivel de definición respecto de su aporte al país. Y, una vez más, no hubo contrapregunta ni intento alguno de precisar o tensionar la respuesta. A esa altura, ya no se trataba de un hecho aislado, sino de un patrón consistente.

El programa continuó desplazándose hacia terrenos cada vez más irrelevantes desde el punto de vista del interés público. Se abordaron aspectos de la vida familiar, de la relación de pareja del presidente y su esposa, e incluso se dedicó tiempo a mostrar su hogar. En un momento particularmente desconcertante, se puso el foco en la mesa del comedor y en la posibilidad de ampliarla. La pregunta es inevitable: ¿qué relación tiene el tamaño de una mesa con la conducción de un país? Ninguna. Sin embargo, ese tipo de contenido ocupó minutos valiosos en una instancia que debía estar orientada a lo sustantivo.

Hubo, eso sí, un momento que merece ser destacado. Al ser consultado sobre el bono por hijo mencionado durante su campaña, el presidente entregó una respuesta que, al menos, contenía un grado de realismo: reconoció la importancia del beneficio, pero advirtió que su implementación debía estar sujeta a la disponibilidad de recursos y que no constituye, por sí solo, una solución estructural. Es una afirmación que introduce un criterio básico de responsabilidad fiscal, algo escaso en el debate público.

En esa misma línea, se abordaron las dificultades asociadas a la maternidad en el contexto actual. Kast mencionó factores como la falta de acceso a buenos establecimientos educacionales, la escasez de espacios recreativos y la inseguridad en los entornos urbanos: diagnósticos atendibles, ampliamente compartidos y, por lo mismo, políticamente seguros. En ese marco, reforzó una idea recurrente en su discurso: la libertad de elegir ser madre, elevando la libertad individual como eje central de su pensamiento.

Pero es precisamente ahí donde emerge la contradicción que el programa decidió ignorar. Resulta, como mínimo, problemático escuchar una defensa enfática de la “libertad” por parte de quien ha sostenido posiciones restrictivas en materias como el aborto, el matrimonio igualitario o el derecho a una muerte digna. A eso se suma su persistente respaldo al régimen de Augusto Pinochet, difícilmente compatible con una concepción robusta de las libertades individuales.

Esa tensión —evidente, sustantiva, políticamente relevante— quedó completamente fuera del radar del entrevistador. Nadie pidió aclaraciones. Nadie exigió coherencia. La idea de “defender la libertad” quedó instalada como una verdad incuestionada.

¿Cuál libertad? Esa es la pregunta que quedó sin respuesta. No por falta de tiempo, sino por falta de voluntad de hacerla. Esto es lo que ocurre cuando se observa al poder, pero se deja de interpelarlo.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80",
    status: "published",
    tags: ["Medios de Comunicación", "Prensa", "Kast", "Las Caras de la Moneda", "Crítica de TV"],
    authorId: "user-camilo-carrera",
    authorName: "Camilo Carrera Orellana",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    createdAt: "2026-06-14T11:00:00Z",
    updatedAt: "2026-06-14T11:00:00Z",
    views: 0
  },
  {
    id: "art-12",
    title: "Chile no está en un “gobierno de emergencia”",
    subtitle: "¿Qué significa realmente gobernar bajo condiciones excepcionales frente a los desafíos ordinarios del Estado?",
    content: `Chile no está en un “gobierno de emergencia”

Por Rubén Oyarzo, Magíster en Instituciones Políticas Públicas
Columna para Biobio.cl

En los últimos días se ha instalado en el debate público la idea de que Chile estaría viviendo un “gobierno de emergencia”. La ministra secretaria general de Gobierno, Mara Sedini, ha respaldado este concepto impulsado por el presidente José Antonio Kast para justificar una agenda política marcada por decisiones rápidas y medidas extraordinarias.

Sin embargo, es necesario preguntarse con serenidad si Chile realmente enfrenta una situación que justifique ese diagnóstico.

La historia reciente del país nos muestra con claridad lo que verdaderamente significa gobernar en emergencia.

El gobierno de Patricio Aylwin enfrentó una transición frágil hacia la democracia, con un régimen militar aún influyente y con Augusto Pinochet como comandante en jefe del Ejército. El país vivía tensiones institucionales profundas, una democracia incipiente y el desafío de reconstruir la convivencia política tras 17 años de dictadura. Aquello sí era gobernar bajo condiciones excepcionales.

Algo similar ocurrió cuando Sebastián Piñera asumió la presidencia en marzo de 2010, apenas semanas después de uno de los terremotos más devastadores de la historia reciente del país. Ciudades destruidas, infraestructura colapsada y una reconstrucción urgente marcaban el inicio de su administración.

Incluso el gobierno de Gabriel Boric debió enfrentar un escenario extraordinario al asumir el poder: una economía golpeada por la pandemia, altos niveles de inflación global y las consecuencias sociales de una crisis sanitaria que alteró profundamente la vida cotidiana.

Esos contextos sí configuraban escenarios de emergencia.

Hoy Chile enfrenta problemas reales y urgentes. La seguridad ciudadana preocupa a millones de personas, el crecimiento económico sigue siendo insuficiente y la confianza en las instituciones requiere ser reconstruida. Nadie puede negar esas dificultades.

Pero reconocer desafíos no es lo mismo que declarar una emergencia nacional permanente.

El riesgo de utilizar el concepto de “gobierno de emergencia” es que puede transformarse más en un recurso político que en un diagnóstico institucional. En democracia, las palabras importan, porque moldean las expectativas de la ciudadanía y el tipo de liderazgo que se ejerce desde el poder.

Además, los propios datos muestran un escenario político que está lejos de una legitimidad excepcional. Según la encuesta Pulso Ciudadano, el presidente José Antonio Kast debutó con un 47,5% de aprobación, una cifra relevante pero que ya ha mostrado señales de descenso en sus primeras mediciones.

Ese dato refleja algo simple: Chile no vive una situación de consenso extraordinario ni un mandato excepcional. Vive, más bien, lo que caracteriza a las democracias modernas: gobiernos que deben construir mayorías, dialogar con la oposición y responder a una ciudadanía exigente.

Las democracias no funcionan bajo estados de emergencia permanentes. Funcionan con instituciones, deliberación y acuerdos políticos.

Chile necesita liderazgo, sin duda. Necesita enfrentar con decisión la crisis de seguridad, recuperar dinamismo económico y fortalecer la confianza en el Estado.

Pero también necesita algo igual de importante: diagnósticos sobrios y responsables sobre el momento que vivimos como país.

Porque cuando todo se presenta como emergencia, el riesgo es que finalmente nada lo sea.

Y la política, para ser efectiva, debe distinguir con claridad entre los desafíos estructurales de un país y las verdaderas crisis que ponen en riesgo su estabilidad institucional.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    status: "published",
    tags: ["Aylwin", "Piñera", "Boric", "Emergencia", "Instituciones"],
    authorId: "user-ruben-oyarzo",
    authorName: "Rubén Oyarzo",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    createdAt: "2026-06-14T13:00:00Z",
    updatedAt: "2026-06-14T13:00:00Z",
    views: 0
  },
  {
    id: "art-13",
    title: "¿Caemos en lo que criticamos... olvidando la humanidad del otro lado?",
    subtitle: "Una autocrítica reflexiva para evitar responder al prejuicio con más generalizaciones y crispación social.",
    content: `¿Caemos en lo que criticamos... olvidando la humanidad del otro lado?

Por Gabriela Boscán, alumna de periodismo
Columna para esquinasur.cl

En un clima político cada vez más tenso, marcado por el inminente cambio de gobierno y por el inicio del debate presidencial en el oficialismo, la discusión sobre migración ha vuelto a tomar fuerza en Chile. Discursos encendidos, promesas de mano dura y narrativas que reducen vidas enteras a cifras o estereotipos se han reinstalado con fuerza en la conversación pública. Y en medio de ese vaivén de opiniones, miedos y frustraciones, hay algo que me viene rondando desde hace tiempo.

A veces siento que el discurso en defensa de la migración, aunque nace desde las mejores intenciones, cae en un error que me incomoda: presentar a “los chilenos” como un enemigo. Como si todos pensaran igual. Como si no existieran historias individuales, contradicciones o dolores propios.

Como si todos nos odiaran.

Lo que me preocupa es que esa rabia que viene desde un lado —la xenofobia, el prejuicio, el desprecio— muchas veces termina siendo respondida con la misma moneda desde el otro lado. En nuestro intento de defendernos, los migrantes también hemos caído en discursos injustos, generalizaciones dañinas, miradas reduccionistas sobre “los chilenos”. Y con eso, borramos la diversidad, las diferencias, la gente que sí nos ha abierto la puerta, la gente que también está sobreviviendo, colapsando, sintiéndose fuera de lugar en su propio país.

Sí, he leído y escuchado comentarios xenófobos. Sí, hay violencia. Sí, hay barreras idiomáticas, culturales, institucionales. Todo eso es real. Pero también es real que no todos los chilenos son discriminadores.

No todos nos quieren fuera.

No todos nos miran con sospecha.

Y sin embargo, en redes sociales, en conversaciones entre migrantes, en intentos de resistencia y denuncia, veo cada vez más frases como “es que los chilenos no saben tratar a la gente”, “es que el chileno es cerrado”, “es que el chileno es envidioso”, “el chileno esto, el chileno lo otro”. Y no puedo evitar pensar: ¿no es eso lo mismo que nos duele cuando lo hacen con nosotros?

Es ahí donde, sin querer, empezamos a convertirnos en aquello que decimos rechazar. Y es fácil caer en esa contradicción, porque en el dolor no siempre analizamos el método de defensa. Como escribió Audre Lorde, “las herramientas del amo nunca desmontarán la casa del amo.” No podemos luchar contra la discriminación replicando sus formas.

La protección de la migración no debería implicar atacar a quienes nacieron aquí.

Podemos visibilizar la discriminación sin convertirnos en lo que criticamos. Podemos hablar de injusticias sin hacer a nuestra contraparte un enemigo. Podemos construir un discurso que apele a la empatía, no a la revancha emocional.

No se puede pedir empatía sin ofrecerla también.

No se puede exigir respeto mientras se generaliza al otro.

No se puede defender la dignidad desde una mirada que desprecia a quien está al frente.

No se necesitan grandes discursos de moralidad, solo un pequeño acto de empatía, un gramo de humanidad, un instante de reflexión. No todos atacan por odio: a veces es el miedo el que habla por ellos.

No se trata de justificar, sino de comprender que en toda verdad hay dos lados.

Entender que para muchas personas no se trata del espacio que ocupamos, ni de nuestra cultura, sino de cómo reaccionamos frente a las acciones de quienes sí tienen prejuicios o miedo.

La migración no es una autopista que va en una sola dirección; es una calle de ida y vuelta. Incluso los movimientos más pequeños cuentan como migración, y nunca sabemos cuándo la ruleta nos tocará.

Migrar me ha enseñado muchas cosas. Pero sobre todo me ha enseñado que todos cargamos algo: frustración, miedo, angustia, ganas de pertenecer. Que no todos los dolores son visibles. Que el chileno de al lado también está atrapado en el mismo metro colapsado, con las mismas pocas lucas en el bolsillo, con la misma ansiedad por la mañana.

En cada paso al futuro que damos, deberíamos ser conscientes de que el lenguaje crea realidades, que las palabras construyen futuro. Y si queremos un cambio de mentalidad, debemos empezar por nosotros mismos.

Quizás no se trate de buscar culpables, sino de empezar a mirarnos con menos miedo y más humanidad. Tal vez eso nos permita, de a poco, entendernos mejor y vivir menos a la defensiva.`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80",
    status: "published",
    tags: ["Convivencia", "Xenofobia", "Migración", "Periodismo"],
    authorId: "user-gabriela-boscan",
    authorName: "Gabriela Boscán",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
    createdAt: "2026-06-14T15:00:00Z",
    updatedAt: "2026-06-14T15:00:00Z",
    views: 0
  },
  {
    id: "art-14",
    title: "11 de marzo: balance de un ciclo y las lecciones para el Chile que viene",
    subtitle: "Una profunda reflexión sobre el fin del proceso refundacional y el retorno de la gradualidad institucional.",
    content: `11 de marzo: balance de un ciclo y las lecciones para el Chile que viene

Por Rubén Oyarzo, exdiputado de la República - Magíster Internacional en Instituciones Políticas Públicas
Columna para el repositorio Columna Pública

El 11 de marzo siempre ha sido una fecha cargada de simbolismo en la política chilena. Marca el inicio y el cierre de ciclos institucionales, pero también invita a algo más importante: detenernos a evaluar con serenidad dónde estamos como país y qué lecciones deja el camino recorrido.

Los últimos años han sido especialmente intensos para Chile. Pasamos de una crisis social profunda en 2019 a un proceso constituyente que generó enormes expectativas en amplios sectores de la ciudadanía. Sin embargo, ese proceso terminó fracasando en dos oportunidades, dejando una sensación de frustración y desgaste político. Aquello no solo representó una derrota institucional, sino también una señal clara de que los cambios estructurales requieren acuerdos amplios, responsabilidad política y una conexión real con las prioridades de las personas.

El país vivió durante varios años bajo la lógica de la refundación, como si cada etapa política implicara partir desde cero. Pero las democracias estables no funcionan así. Las reformas profundas necesitan legitimidad social, gradualidad y una construcción pasiva de mayorías. Cuando se intenta avanzar sin esas bases, lo más probable es que los procesos terminen debilitándose antes de consolidarse.

El gobierno que termina su ciclo llegó con una narrativa de transformación generacional y con la promesa de abrir una nueva etapa para el país. En algunos aspectos logró instalar debates necesarios, como la importancia de fortalecer la protección social, avanzar en derechos laborales y modernizar ciertas áreas del Estado. Sin embargo, también enfrentó dificultades evidentes para traducir esas ideas en resultados concretos que fueran percibidos por la ciudadanía.

Durante el período, la economía mostró señales de debilidad en distintos momentos, con bajo crecimiento y un escenario internacional complejo que impactó las expectativas. Al mismo tiempo, la crisis de seguridad se consolidó como una de las principales preocupaciones de la población, obligando a replantear políticas públicas que durante años fueron abordadas con excesiva timidez o con visiones ideológicas que no siempre se ajustaron a la realidad del país.

A esto se sumó un contexto político fragmentado, con un Congreso sin mayorías claras, donde muchas reformas relevantes terminaron diluyéndose o transformándose en versiones muy distintas a las que originalmente se habían propuesto. Gobernar en esas condiciones exige una alta capacidad de articulación política, algo que no siempre estuvo presente con la fuerza necesaria.

Parte de esas dificultades también tiene relación con el aprendizaje del ejercicio del poder por parte de una generación política nueva. Gobernar un país es muy distinto a movilizar causas desde la oposición o desde el movimiento estudiantil. Exige conducción, templanza y comprensión de los límites que impone la realidad.

La gran lección de estos años es que los proyectos políticos no pueden construirse desde la confrontación permanente. Chile necesita reformas, pero también necesita estabilidad, certezas y acuerdos duraderos que permitan proyectar el desarrollo de la nación en el largo plazo. Las sociedades que progresan no son aquellas que cambian completamente su rumbo cada cuatro años, sino aquellas capaces de construir consensos básicos sobre temas estratégicos.

En ese sentido, el principal desafío del nuevo ciclo político será recuperar la capacidad de diálogo directo entre sectores que prefirieron la trinchera antes que la cooperación. Los problemas estructurales de Chile no se resolverán desde dogmatismos, sino desde acuerdos que pongan al país por delante. Trascender los ciclos electorales para reconstruir confianzas es, probablemente, el verdadero desafío del país que viene.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    status: "published",
    tags: ["Ciclo Político", "Proceso Constituyente", "Gradualidad", "Gobernabilidad", "Chile", "Centro"],
    authorId: "user-ruben-oyarzo",
    authorName: "Rubén Oyarzo",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    createdAt: "2026-06-15T08:00:00Z",
    updatedAt: "2026-06-15T08:00:00Z",
    views: 0
  },
  {
    id: "art-15",
    title: "¿Primará la moderación que Chile necesita?",
    subtitle: "Un llamado a priorizar la conducción técnica de salud y orden sobre la crispación cultural estéril.",
    content: `¿Primará la moderación que Chile necesita?

Por Dr. Ricardo Fábrega, Presidente de Corporación Alma Ata.
Columna para el repositorio Columna Pública

Comienza un nuevo período presidencial y, con él, una etapa en que las señales importan tanto como las decisiones. Chile llega a este cambio de mando después de años de polarización, fatiga política y una evidente erosión de la confianza en las instituciones. Por eso, más allá de las legítimas diferencias ideológicas, lo que muchos esperan del nuevo gobierno es una conducción sobria, eficaz y consciente de las complejidades del país real.

En ese marco, algunas de las primeras señales del presidente José Antonio Kast merecen ser recibidas con interés. Su discurso del triunfo mostró un tono más presidencial que partidario, más orientado a la responsabilidad de gobernar que a la lógica de la campaña. Hubo en esas palabras una apelación a la unidad, al trabajo serio y a una comprensión más amplia de lo que significa conducir el Estado en un país diverso y tensionado. Esa disposición es valiosa. Chile necesita que el nuevo mandatario ejerza plenamente ese registro.

Esa impresión inicial se ve reforzada, además, por parte de sus nombramientos. En especial, el equipo de salud ha sido recibido positivamente por su perfil técnico, su experiencia y su conocimiento del sistema sanitario. En un área tan sensible para la vida cotidiana de las personas, contar con profesionales competentes y con trayectoria es una buena noticia. No garantiza resultados, pero sí sugiere una orientación que privilegia la capacidad de gestión por sobre la mera afinidad ideológica. En tiempos de listas de espera, crisis de financiamiento y desgaste institucional, esa señal debe ser valorada.

Sería un error negar estos elementos por simple espíritu opositor. Una democracia sana exige también reconocer las decisiones acertadas cuando ocurren. Al país le conviene que el gobierno acierte, especialmente en materias tan decisivas como salud, seguridad, crecimiento y funcionamiento del Estado. La crítica responsable no consiste en cerrarse desde el primer día, sino en observar con atención, apoyar lo que va en la dirección correcta y advertir, con claridad, aquello que puede alejar al país de una convivencia democrática más serena.

Y es precisamente ahí donde subsisten reservas legítimas.

Junto a las señales de moderación, han aparecido otras que generan inquietud. No ayuda, por ejemplo, la proximidad simbólica con liderazgos internacionales que representan estilos de gobierno polarizantes o iliberales. Tampoco contribuyen los gestos que parecen dirigidos más a consolidar una identidad de trinchera que a ampliar la base de legitimidad de un presidente que debe gobernar para todo Chile. Una cosa es tener convicciones firmes; otra, muy distinta, es construir un clima político innecesariamente tensionado a partir de referencias que dividen más de lo que convocan.

Del mismo modo, decisiones como la suspensión de reuniones de traspaso entre ministros proyectaron una señal inconveniente. En un proceso de cambio de mando, la continuidad institucional debe estar por encima de los desacuerdos coyunturales. Un presidente puede marcar diferencias con su antecesor sin debilitar las formas republicanas. Puede ser firme sin parecer impaciente. Puede ejercer autoridad sin alimentar innecesariamente la crispación. En un país que ha vivido demasiados años bajo una lógica de confrontación permanente, ese equilibrio importa.

Las encuestas muestran precisamente ese estado de ánimo: no un rchazo cerrado, pero tampoco una adhesión contundente. Más bien revelan una ciudadanía que observa con atención, con expectativas acotadas y con confianza todavía en construcción. Es una situación comprensible. Kast no llega a La Moneda con un consenso amplio ni con un capital político indiscutido. Llega con una oportunidad: demostrar que puede transformarse en un jefe de Estado capaz de ampliar su margen de apoyo mediante moderación, competencia y sentido institucional.

Ese es, probablemente, el verdadero desafío de esta etapa. No basta con haber ganado. Gobernar exige algo distinto de la campaña: más templanza que épica, más construcción que confrontación, más capacidad de escuchar que necesidad de reafirmarse ante los propios. La ciudadanía, en general, no espera de un gobierno una permanente batalla cultural. Espera orden, soluciones concretas, estabilidad y resultados.

Por eso, el mejor camino para el nuevo presidente es perseverar en la versión más sobria y técnica que mostró en su discurso inicial y en algunos de sus nombramientos. Esa es la versión que puede abrir espacios de confianza más allá de sus adherentes. Esa es la versión que puede encontrar disposición al diálogo incluso entre quienes no votaron por él. Esa es, también, la versión que más necesita hoy Chile.

Al comenzar este nuevo período, lo razonable no es ni el entusiasmo ingenuo ni el rechazo automático. Lo razonable es una actitud de vigilancia democrática, apertura prudente y exigencia institucional. Valorar lo que parece correcto, como el tono moderado y los equipos técnicos en áreas sensibles, y al mismo tiempo mantener reservas frente a aquello que podría empujar al gobierno hacia una dinámica más divisiva.

Chile necesita, con urgencia, menos exaltación y más gobierno. Menos gesto ideológico y más sobriedad. Menos trinchera y más conducción. Si el presidente entiende eso, tendrá margen para construir confianza. Si no, el país corre el riesgo de volver demasiado pronto a una política atrapada en sus peores reflejos.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80",
    status: "published",
    tags: ["Moderación", "Salud Pública", "Gobernabilidad", "Transición", "Kast", "Centro"],
    authorId: "user-ricardo-fabrega",
    authorName: "Dr. Ricardo Fábrega",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-15T09:00:00Z",
    views: 0
  },
  {
    id: "art-16",
    title: "UNA NUEVA TEMPORADA",
    subtitle: "El reordenamiento de liderazgos de oposición y el dúo protagónico Boric–Kast.",
    content: `UNA NUEVA TEMPORADA

por Uriel González, Administrador Público - Coordinador Ejecutivo de ONG En Modo Verde
Columna para el repositorio Columna Pública

El general Baquedano ya está en la plaza que lleva su nombre y será telón de fondo del 11 de marzo de 2026, día que se comienza a escribir un nuevo libreto de la política chilena.

La ceremonia en el Congreso Nacional, con la banda presidencial y la piocha de O’Higgins, proyecta continuidad, pero más allá de rituales el sistema político entra en una fase de reordenamiento mucho menos estable de lo que aparenta: se levanta el telón de una nueva temporada, con otro elenco de personajes en disputa.

Muchos quieren ver en esta etapa una reedición del viejo ciclo Bachelet–Piñera, ahora en modo Boric–Kast, y la idea no carece de fundamentos: Boric ha dejado ver que no piensa desaparecer al abandonar La Moneda, y se mantendrá como referencia visible de oposición frente al nuevo gobierno, y Kast, a su vez, también necesita un antagonista reconocible para disciplinar a los suyos, para lo que Gabriel Boric le resulta ideal, pues el rechazo al presidente saliente y a todo lo que encarna se ha convertido en una pieza estable del repertorio de la derecha chilena de hoy.

Sin embargo, Boric no tiene asegurado el papel protagónico de la oposición, ya que a ese escenario han comenzado a entrar actores y actrices que parecían cómodos en roles de reparto, pero que cuentan con peso propio y opciones de disputar protagonismo, como Jeannette Jara, quien demostró cercanía al público y autonomía política frente al gobierno y su partido, Camila Vallejo, con declaraciones sobre los temas que para el mundo progresista son los más importantes, y Tomás Vodanovic, campeón de las redes sociales, construyendo redes políticas con otros alcaldes y el mundo de la ex concertación, ganando presencia en escena con una persistencia que ya no parece casual.

Además, la idea de reemplazar el eje Bachelet–Piñera por uno Boric–Kast choca con un mundo radicalmente distinto: en el ciclo anterior todavía existían partidos relativamente disciplinados, con apenas uno que otro díscolo; Hoy predominan la volatilidad electoral, la menor cohesión y los proyectos personalistas. Y también cambió el clima internacional: de la serenidad de Obama se pasó a la agresividad de Trump, el caótico showman de este tiempo.

Kast sale al escenario en medio de esa tensión: puede gobernar como la derecha chilena clásica, de orden, seguridad y ajuste fiscal, o dejarse absorber por la guerra cultural que representan Trump y Milei; Hasta ahora ha intentado moverse en ambos libretos a la vez: arma un gabinete con piñeristas, tecnócratas y ex parlamentarios, para ampliar base y transmitir gobernabilidad, pero a la vez viaja a sostener motosierras y abrazar a Trump y Orbán, coqueteando con un estilo de personaje político más confrontacional y fanatizado.

Si Kast se mueve demasiado hacia la guerra cultural, pierde gobernabilidad interna y aparece más como expresión local del trumpismo, con el servilismo geopolítico que conlleva; pero si se modera demasiado, arriesga decepcionar, o aburrir, a una base que votó por una promesa de cambio y restauración conservadora, por lo que este nuevo protagonista del poder debe administrar el país y construir la identidad política del kastismo en medio de este mundo convulso.

El cambio de mando no será entonces solo el escenario del rito y los discursos, sino la nueva obra que comienza: Boric y Kast se eligieron mutuamente como protagonistas y antagonistas, y la pregunta es si podrán realmente ocupar los lugares que alguna vez tuvieron Bachelet y Piñera, o si terminarán siendo apenas los actores más visibles de un sistema fragmentado, competitivo y demencial; el 11 de marzo se abre una pelea por definir cómo se llamará la obra y quiénes serán sus actores.

El show debe continuar.`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&q=80",
    status: "published",
    tags: ["Oposición", "Gabinete", "Boric", "Kast", "Guerra Cultural"],
    authorId: "user-uriel-gonzalez",
    authorName: "Uriel González",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80",
    createdAt: "2026-06-15T11:00:00Z",
    updatedAt: "2026-06-15T11:00:00Z",
    views: 0
  },
  {
    id: "art-17",
    title: "Hechos, no consignas: responsabilidad y tránsito en el caso de Lo Barnechea",
    subtitle: "Análisis objetivo del choque que involucró a Fran Maira y un repartidor de delivery.",
    content: `Hechos, no consignas: responsabilidad y tránsito en el caso de Lo Barnechea

Por Rodrigo Diaz, asesor y académico
Columna para el repositorio Columna Pública

El 24 de febrero de 2026, entre las 21:45 y 22:00 horas, en la intersección de Avenida La Dehesa con Calle Robles, en Lo Barnechea, se produjo una colisión que hoy concentra debate público, especulación digital y juicio moral anticipado. Fran Maira conducía un Mercedes-Benz acompañada de su padre cuando viró a la izquierda hacia Robles. En ese momento impactó a un motociclista de 23 años, repartidor de delivery, quien avanzaba en línea recta por La Dehesa y resultó con lesiones graves, incluida contusión craneal, requiriendo reanimación en el lugar y traslado a una clínica privada donde permanece en estado crítico.

Los antecedentes oficiales aportados por Carabineros, Fiscalía Oriente, Municipalidad de Lo Barnechea y registros de cámaras municipales difundidos por medios como Biobío Chile, Mega y T13, indican lo siguiente: el vehículo mayor realizó el viraje con luz verde general, pero sin flecha verde exclusiva activada; el motociclista avanzaba también con luz verde en su sentido; el semáforo funciona en tres tiempos y no existe informe oficial de falla; no hay aún estimación pública de velocidad, pues la SIAT dispone de 90 días para periciar dinámica, sincronización y velocidades.

Fran Maira fue formalizada por cuasidelito de lesiones graves conforme al artículo 490 del Código Penal, quedando con arraigo nacional y firma mensual mientras dura la investigación. Sus exámenes de alcoholemia arrojaron 0,00 g/l y el test de drogas fue negativo.

Hasta ahí, lo oficial.

En paralelo, también hay hechos confirmados respecto del motociclista: no portaba licencia clase A vigente, no llevaba documentación personal ni del vehículo, y la motocicleta no tenía placa patente. Esas conductas configuran infracciones gravísimas conforme a la Ley de Tránsito y a la denominada Ley de Patente Cero (Ley 21.601). Sobre luces apagadas y exceso de velocidad existen menciones en matinales y redes sociales, pero no hay confirmación pericial pública al respecto. Eso, por rigor, debe señalarse con claridad.

El debate público, sin embargo, ha tendido a simplificarse: una figura pública, un lesionado grave y una narrativa emocional inmediata. Pero en materia de tránsito, la responsabilidad no se determina por popularidad ni por estado clínico, sino por conductas objetivas y verificables.

Virar sin flecha verde exclusiva puede constituir infracción si no se cede el paso a quien tiene preferencia. Conducir sin licencia habilitante, sin patente y sin documentación no es un detalle administrativo: es una ruptura estructural del sistema de control y responsabilidad vial. La licencia acredita conocimientos mínimos; la patente permite identificación; la documentación habilita trazabilidad jurídica. Cuando esos elementos no están, el estándar de diligencia exigible cambia.

El punto central no es exculpar anticipadamente a una parte ni condenar moralmente a la otra. El punto es recordar que el tránsito es un sistema normativo diseñado precisamente para evitar tragedias. Y ese sistema se basa en reglas claras: prioridad de paso, señalización, velocidad razonable y cumplimiento de requisitos legales.

La investigación de la SIAT determinará si hubo exceso de velocidad, si existió falla semafórica, si la visibilidad fue afectada por luces apagadas o si la maniobra de viraje incumplió el deber de ceder el paso. Hasta entonces, todo lo que exceda esos antecedentes es especulación. Pero sí hay algo que puede afirmarse sin esperar peritaje: la responsabilidad en tránsito es compartida cuando múltiples normas son infringidas. Convertir el debate en una dicotomía emocional entre una “víctima absoluta” versus “culpable evidente”, empobrece la discusión y erosiona el principio básico de cualquier análisis jurídico serio: los hechos primero, las conclusiones después.

Una vida está en riesgo, y eso es lo verdaderamente grave. Precisamente por eso el análisis debe ser frío, técnico y completo. En seguridad vial, la compasión no reemplaza la norma, y la norma no se suspende por indignación colectiva.`,
    category: "Análisis",
    imageUrl: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80",
    status: "published",
    tags: ["Ley de Tránsito", "SIAT", "Seguridad Vial", "Lo Barnechea", "Fran Maira"],
    authorId: "user-rodrigo-diaz",
    authorName: "Rodrigo Diaz",
    authorAvatar: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&q=80",
    createdAt: "2026-06-15T13:00:00Z",
    updatedAt: "2026-06-15T13:00:00Z",
    views: 0
  },
  {
    id: "art-18",
    title: "El Efecto Troxler de la izquierda chilena.",
    subtitle: "Cómo el estrecho enfoque electoral invisibiliza transformaciones estructurales periféricas fundamentales.",
    content: `El Efecto Troxler de la izquierda chilena.

Por José Carrera Orellana, fundador Conchalí Centenario.
Columna para El Ciudadano

En psicología visual se denomina Efecto Troxler a la ilusión óptica en donde los elementos periféricos tienden a desaparecer al fijar la mirada en un punto central por algunos segundos. Este fenómeno descubierto por el médico y filósofo suizo Ignaz Paul Vital Troxler, en los primeros años del Siglo XIX, ocurre por el funcionamiento de las neuronas sensoriales que, buscando mayor eficiencia, dejan de enviar información al cerebro sobre estímulos que consideran irrelevantes o estáticos. Así aquello ubicado en la periferia visual sencillamente tiende a desaparecer para nuestra percepción consciente, sin embargo los elementos siguen allí, reales y materiales aunque invisibles a nuestra conciencia.

Esta trampa visual es útil para graficar el estado actual del debate de la izquierda chilena, cuyos bordes están aún —y como casi siempre— delimitados por las urgencias electorales y sus resultados. Si bien este es un tema ineludible su naturaleza no alcanza a explicar en precisión las claves del tiempo histórico que nos corresponde vivir. El peligro no radica en realizar análisis suficientemente autocríticos, sino en instalar dicho debate como una realidad cerrada y autosuficiente - un asunto “por sí y para sí”-. Al hacerlo, al igual que en el Efecto Troxler, los elementos trascendentales del cuadro político quedan relegados a la periferia visual del análisis y en consecuencia se vuelven invisibles para nuestro consciente colectivo. 

El análisis político debe ser multifactorial, de lo contrario sus conclusiones y las estrategias que se emprendan corren el riesgo de no producir las transformaciones que pretende por cuanto su diagnóstico carece de integralidad analítica. Por ejemplo, ¿Es posible entender la derrota electoral presidencial sin el concurso del contexto geopolítico mundial? ¿Es posible explicar el triunfo de la ultraderecha sin una poderosa fuerza comunicacional? son algunas de las preguntas ausentes en el debate, reemplazadas por recriminaciones recíprocas de dogmatismos o concesiones ideológicas, un estadio de debate muy poco prometedor para la izquierda y su tarea histórica.

En este sentido bien vale tener a la vista la tesis desarrollada por el teórico marxista Antonio Gramsci para diferenciar la Revolución Pasiva —concepto acuñado antes por el historiador y político italiano Vincenzo Cuoco— de la Contrarreforma. En ella sugirió que la revolución pasiva se trata de un proceso de transformación impulsado “por arriba” caracterizado por la ausencia de una iniciativa popular unitaria y suficientemente organizada que genere una ruptura tal y como ocurre en un proceso de revolución “jocabina”, y cuyos dos momentos fundamentales son una compleja dialéctica que tiene lugar entre la Restauración, es decir la reacción conservadora ante una ruptura o transformación profunda, y la Renovación, cuando las clases dominantes realizan concesiones para satisfacer parcialmente algunas demandas populares como una forma de contención, de cuyo resultado efectivamente, señalaba el teórico marxista, se “modifican progresivamente la composición anterior de las fuerzas y por la tanto se transforman en matriz de nuevas modificaciones”

Esta teoría de Gramsci es clave pues por una parte constituye un marco de análisis perfectamente vigente para comprender la coyuntura geopolítica, caracterizada por el fin del consenso de dominación a escala mundial sin que aún se resuelva la disputa por el consenso de los próximos 50 años, es decir lo que él mismo llamó Interregno. Y por otra parte porque aporta elementos de comprensión fundamentales en torno a las particularidades del “Estallido Social” de octubre de 2019 y sus acontecimientos posteriores incluidas las recientes elecciones presidenciales. Pero además es relevante porque supone, precisamente, la obligación de identificar con precisión los avances y retrocesos de un proceso de transformación como el chileno, para comprender el punto desde el que continúa.

Valga decir aquí, que no se trata de una convocatoria a la detención sino a la precisión so pretexto de comprender colectivamente el punto de continuidad del proceso de transformación y la legitimidad de una determinada estrategia, para derribar cualquier vestigio de anquilosamiento teórico y sobre todo no ser obsecuentes con las deficiencias detectadas, ni por cierto para resolver superficialmente las diferencias en el análisis y de proyectos. Se trata de hacer propio el rigor con que Lenin examinaba la realidad, graficado en su célebre obra ¿Qué hacer? cuando - citando a Dmitri Písarev - señaló que “no existe disparidad entre los sueños y la realidad siempre que el soñador crea seriamente en su sueño, se fije atentamente en la vida, compare sus observaciones con sus castillos en el aire y trabaje con conciencia porque se cumplan sus fantasías.”

“La realidad no es estática”, es una frase que suele ser parte del ABC de la política, sin embargo en ocasiones el análisis y las estrategias sí lo son. La izquierda debe reflexionar con perspectiva amplia o seguirá ignorando claves que la condenan a quedar atrapada en una verdadera aporía reflexiva, tal y como ocurre con el efecto troxler.`,
    category: "Opinión",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&q=80",
    status: "published",
    tags: ["Izquierda", "Gramsci", "Efecto Troxler", "Lenin", "Leyes del Péndulo"],
    authorId: "user-jose-carrera",
    authorName: "José Carrera Orellana",
    authorAvatar: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=300&q=80",
    createdAt: "2026-06-15T14:00:00Z",
    updatedAt: "2026-06-15T14:00:00Z",
    views: 0
  }
];

