import type { Heading } from "@/design-system/demo/project-story";

type NodeCopy = { name: string; sub: string; analogy: string };

export interface FabricaStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (pct: number) => string; yes: string; no: string; thresholdLabel: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; mine: (pct: number) => string; raw: string; repeats: string; sentence: (mine: number, raw: number, topics: number) => string; verdict: (lost: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; statusLabels: { active: string; danger: string; success: string }; tapeLabel: string; nodes: { logs: NodeCopy; cleaner: NodeCopy; exam: NodeCopy; discarded: NodeCopy }; tape: { served: string; rerouted: string; lost: string }; lostOf: (n: number) => string };
}

export const STORY: Record<"en" | "es", FabricaStory> = {
  en: {
    name: "Evaluation set builder",
    oneLiner: "A good exam asks each thing once, even when people phrase it many ways, and leaves no topic out.",
    chips: ["Test sets", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "A teacher builds an exam from the questions students asked all term. Many are the same question in other words, so she keeps one of each. If she trims too hard, she also throws out a question from another topic that only looked similar, and that topic never reaches the exam.",
        "Here the questions are thirty real customer messages about six banking topics. The slider decides how alike two messages must be before the second one is dropped as a repeat.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "the students' questions", means: "30 customer messages" },
        { term: "the same question in other words", means: "a repeat of the same topic" },
        { term: "a look-alike from another topic", means: "a message dropped by mistake" },
        { term: "the exam", means: "the test set, three questions per topic" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Thirty messages, five for each of six topics. Each one is compared with the messages already kept, in order.",
      question: (pct) => `Before you run it, place a bet: dropping messages that are ${pct}% alike or more, is a message from another topic thrown out as a repeat?`,
      yes: "Yes, a topic loses one",
      no: "No, only true repeats go",
      thresholdLabel: "How alike two messages must be to count as repeats",
      note: "Each square is one message, in order. Green stays, blue was a repeat of its own topic, red was thrown out because it looked like a message from another topic.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The messages could not be compared. Try another setting.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "Cleaned", accent: "or as it came" },
      lead: "The same exam of 18 questions, three per topic. One side cleans the repeats with your setting; the other takes the messages as they came.",
      mine: (pct) => `Cleaned at ${pct}%`,
      raw: "No cleaning",
      repeats: "repeated questions in the exam",
      sentence: (mine, raw, topics) => {
        const cover = topics === 6 ? "all six topics" : `${topics} of the six topics`;
        if (mine === raw) return `Both exams have ${mine} repeated ${mine === 1 ? "question" : "questions"}. Yours covers ${cover}.`;
        if (mine > raw) return `This time cleaning made it worse: ${mine} repeats against ${raw}.`;
        return `Your exam has ${mine === 0 ? "no" : mine} repeated ${mine === 1 ? "question" : "questions"} and covers ${cover}. Without cleaning, ${raw} of the 18 questions repeat an earlier one.`;
      },
      verdict: (n) => n === 0 ? "No message from another topic was thrown out" : n === 1 ? "1 message from another topic was thrown out" : `${n} messages from other topics were thrown out`,
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When a team tests an assistant with questions taken from real conversations and wants each topic counted once. I picture a bank's support assistant before a release.",
      notLabel: "Not needed",
      not: "When the test questions are written by hand, one per case, and nobody copies them from conversation logs.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I watched both ways an exam goes wrong: repeats that inflate the score, and a topic that quietly disappears. The slider shows the point where one problem turns into the other.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "Token-set Jaccard similarity with greedy, order-keeping deduplication: a message stays only if it is below the threshold against every message already kept.",
        "Messages are grouped by their labelled topic and the first three of each go to the test set. The topic label stands in for an intent classifier.",
        "The status of every message at each slider stop is pinned in a fixture read by the TypeScript and Python suites. Counting repeats in the exam uses the committed 0.8 cut.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "What happened to each message",
      caption: "Watch each message stay, fold into its twin, or get thrown out.",
      statusLabels: { active: "comparing", success: "kept", danger: "lost a topic" },
      tapeLabel: "Thirty customer messages, in order",
      nodes: {
        logs: { name: "Messages", sub: "30 from customers", analogy: "the students' questions" },
        cleaner: { name: "Cleaner", sub: "compares with kept", analogy: "the teacher" },
        exam: { name: "Kept", sub: "goes to the exam", analogy: "the exam" },
        discarded: { name: "Dropped", sub: "counted as a repeat", analogy: "the scrap pile" },
      },
      tape: { served: "kept", rerouted: "repeat of its topic", lost: "thrown out from another topic" },
      lostOf: (n) => `Messages lost from another topic: ${n}`,
    },
  },
  es: {
    name: "Fábrica",
    oneLiner: "Un buen examen pregunta cada cosa una vez, aunque la gente la diga de muchas formas, y no deja ningún tema fuera.",
    chips: ["Conjuntos de prueba", "2 min", "Demo en vivo"],
    analogy: {
      heading: { accent: "La analogía" },
      paragraphs: [
        "Una maestra arma un examen con las preguntas que hicieron sus alumnos durante el semestre. Muchas son la misma pregunta con otras palabras, así que se queda con una de cada una. Si recorta de más, también tira una pregunta de otro tema que solo se parecía, y ese tema ya no llega al examen.",
        "Aquí las preguntas son treinta mensajes reales de clientes sobre seis temas bancarios. El slider decide qué tan parecidos deben ser dos mensajes para que el segundo se descarte como repetido.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "las preguntas de los alumnos", means: "30 mensajes de clientes" },
        { term: "la misma pregunta con otras palabras", means: "una repetida del mismo tema" },
        { term: "una parecida de otro tema", means: "un mensaje descartado por error" },
        { term: "el examen", means: "el conjunto de prueba, tres preguntas por tema" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Treinta mensajes, cinco de cada uno de seis temas. Cada uno se compara, en orden, con los que ya se quedaron.",
      question: (pct) => `Antes de correrlo, apuesta: descartando los mensajes que se parecen ${pct}% o más, ¿se tira un mensaje de otro tema como si fuera repetido?`,
      yes: "Sí, un tema pierde uno",
      no: "No, solo se van las repetidas",
      thresholdLabel: "Qué tan parecidos deben ser dos mensajes para contar como repetidos",
      note: "Cada cuadrito es un mensaje, en orden. Verde se queda, azul era una repetida de su propio tema, rojo se tiró porque se parecía a un mensaje de otro tema.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudieron comparar los mensajes. Prueba con otro ajuste.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Limpio", accent: "o tal como llegó" },
      lead: "El mismo examen de 18 preguntas, tres por tema. De un lado se limpian las repetidas con tu ajuste; del otro se toman los mensajes tal como llegaron.",
      mine: (pct) => `Limpio al ${pct}%`,
      raw: "Sin limpiar",
      repeats: "preguntas repetidas en el examen",
      sentence: (mine, raw, topics) => {
        const cover = topics === 6 ? "los seis temas" : `${topics} de los seis temas`;
        if (mine === raw) return `Los dos exámenes tienen ${mine} ${mine === 1 ? "pregunta repetida" : "preguntas repetidas"}. El tuyo cubre ${cover}.`;
        if (mine > raw) return `Esta vez limpiar salió peor: ${mine} repetidas contra ${raw}.`;
        return `Tu examen tiene ${mine === 0 ? "cero preguntas repetidas" : mine === 1 ? "1 pregunta repetida" : `${mine} preguntas repetidas`} y cubre ${cover}. Sin limpiar, ${raw} de las 18 preguntas repiten una anterior.`;
      },
      verdict: (n) => n === 0 ? "No se tiró ningún mensaje de otro tema" : n === 1 ? "Se tiró 1 mensaje de otro tema" : `Se tiraron ${n} mensajes de otros temas`,
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve", after: "?" },
      worthLabel: "Vale la pena",
      worth: "Cuando un equipo prueba un asistente con preguntas sacadas de conversaciones reales y quiere contar cada tema una sola vez. Pienso en el asistente de soporte de un banco antes de un lanzamiento.",
      notLabel: "No hace falta",
      not: "Cuando las preguntas de prueba se escriben a mano, una por caso, y nadie las copia de los registros de conversaciones.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Vigilé las dos formas en que un examen sale mal: repetidas que inflan la calificación y un tema que desaparece sin avisar. El slider muestra el punto donde un problema se convierte en el otro.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Similitud de Jaccard sobre conjuntos de palabras, con deduplicación voraz que respeta el orden: un mensaje se queda solo si está por debajo del umbral contra todos los que ya se quedaron.",
        "Los mensajes se agrupan por su tema etiquetado y los tres primeros de cada uno van al conjunto de prueba. La etiqueta de tema hace las veces de un clasificador de intención.",
        "El estado de cada mensaje en cada posición del slider está fijado en un fixture que leen las pruebas de TypeScript y de Python. Para contar repetidas en el examen se usa el corte de 0.8 del proyecto.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Lo que pasó con cada mensaje",
      caption: "Mira cómo cada mensaje se queda, se junta con su gemelo o se tira.",
      statusLabels: { active: "comparando", success: "se queda", danger: "perdió un tema" },
      tapeLabel: "Treinta mensajes de clientes, en orden",
      nodes: {
        logs: { name: "Mensajes", sub: "30 de clientes", analogy: "las preguntas de los alumnos" },
        cleaner: { name: "Limpieza", sub: "compara con los que quedan", analogy: "la maestra" },
        exam: { name: "Se queda", sub: "va al examen", analogy: "el examen" },
        discarded: { name: "Descartado", sub: "contado como repetido", analogy: "el bote de basura" },
      },
      tape: { served: "se queda", rerouted: "repetida de su tema", lost: "tirado siendo de otro tema" },
      lostOf: (n) => `Mensajes perdidos de otro tema: ${n}`,
    },
  },
};
