"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { useUIStore } from "@/store/uiStore";

// Toda a coreografia usa só `transform` e `opacity`, por CSS e Web Animations API, e é entregue ao
// compositor de uma vez. A abertura roda justamente enquanto a thread principal está mais ocupada
// (hidratação, three.js, shaders); uma timeline em rAF travaria e saltaria junto com ela.

// Teto de espera por fontes e WebGL: a abertura nunca segura o Hero por mais que isso.
const MAX_WAIT_MS = 4000;
// A varredura só começa depois que as primeiras letras (animação CSS) já subiram.
const SWEEP_START_MS = 400;
const SWEEP_MS = 800;
// As linhas saem do nome com a varredura ainda terminando, para os movimentos se emendarem.
const SEAM_AT_MS = SWEEP_MS - 130;
const OPEN_AT_MS = SEAM_AT_MS + 130;
const OPEN_MS = 850;
const LETTER_STAGGER_MS = 40;

const EASE_IN_OUT_EXPO = "cubic-bezier(0.87, 0, 0.13, 1)";
const EASE_IN_OUT_CUBIC = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_IN_CUBIC = "cubic-bezier(0.32, 0, 0.67, 0)";

// Curva da varredura. Cursor, recorte e contador saem da mesma função, amostrada em keyframes,
// então andam juntos quadro a quadro.
const sweepEase = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const SWEEP_SAMPLES = 40;

function slideFrames(distance: number): Keyframe[] {
  return Array.from({ length: SWEEP_SAMPLES + 1 }, (_, index) => {
    const offset = index / SWEEP_SAMPLES;
    return { offset, transform: `translateX(${sweepEase(offset) * distance}px)` };
  });
}

// Instante (0 a 1) em que a varredura cruza `value` (0 a 1), por busca binária na curva.
function crossing(value: number) {
  let low = 0;
  let high = 1;
  for (let step = 0; step < 20; step++) {
    const middle = (low + high) / 2;
    if (sweepEase(middle) < value) low = middle;
    else high = middle;
  }
  return high;
}

// Keyframes em degrau de uma coluna do contador (unidade, dezena ou centena): a tira de dígitos
// sobe uma linha no instante exato em que o cursor passa pelo número correspondente.
function digitFrames(place: number, lineHeight: number): Keyframe[] {
  const frames: Keyframe[] = [{ offset: 0, transform: "translateY(0px)", easing: "step-end" }];
  let current = 0;
  for (let value = 1; value <= 100; value++) {
    const digit = Math.floor(value / place) % 10;
    if (digit === current) continue;
    current = digit;
    frames.push({
      offset: crossing((value - 0.5) / 100),
      transform: `translateY(${-digit * lineHeight}px)`,
      easing: "step-end",
    });
  }
  frames.push({ offset: 1, transform: `translateY(${-current * lineHeight}px)` });
  return frames;
}

const DIGIT_PLACES = [100, 10, 1];
// Linhas recolhidas por `transform` inline (e não pela utilidade `scale-x-0`, que usa a propriedade
// `scale` e se multiplicaria com o `transform` animado, mantendo-as em zero).
const SEAM_CLOSED = { transform: "scaleX(0)" };
const DIGITS = Array.from("0123456789");

interface PreloaderProps {
  label: string;
  name: string;
}

// Mesmas caixas de letra do `HeroTitle` (sem kerning, espaço de 0.3em), para o nome cair exatamente sobre o h1.
function Letters({ text, rise = false }: { text: string; rise?: boolean }) {
  return (
    <span className="flex">
      {Array.from(text).map((char, index) => (
        <span
          key={index}
          className="block overflow-y-clip py-[0.2em] -my-[0.2em]"
          style={char === " " ? { width: "0.3em" } : undefined}
        >
          <span
            data-intro="letter"
            className={rise ? "block animate-intro-rise" : "block"}
            style={rise ? { animationDelay: `${index * LETTER_STAGGER_MS}ms` } : undefined}
          >
            {char}
          </span>
        </span>
      ))}
    </span>
  );
}

// Abertura do site (ver NavigationTask.spec.md): o nome é o indicador de carregamento e, ao fim,
// vira o título do Hero. Roda uma vez, na primeira carga.
export function Preloader({ label, name }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);
  const done = useUIStore((state) => state.introPhase === "done");
  const setIntroPhase = useUIStore((state) => state.setIntroPhase);
  const lenis = useLenis();

  // Scroll travado enquanto a cortina cobre a tela: a entrega mede o h1 com a página no topo.
  useEffect(() => {
    if (!lenis || done) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis, done]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const find = (key: string) => root.querySelector<HTMLElement>(`[data-intro="${key}"]`);
    const findAll = (key: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-intro="${key}"]`));

    const animations: Animation[] = [];
    const timers: number[] = [];
    let disposed = false;
    let unsubscribe = () => {};

    const play = (target: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      if (!target) return null;
      const animation = target.animate(keyframes, { fill: "both", ...options });
      animations.push(animation);
      return animation;
    };
    const after = (ms: number, callback: () => void) => {
      timers.push(window.setTimeout(() => !disposed && callback(), ms));
    };
    // Um `cancel()` na limpeza rejeita `finished`; nesse caso não há nada a continuar.
    const whenFinished = (animation: Animation | null, callback: () => void) => {
      if (animation) animation.finished.then(() => !disposed && callback(), () => {});
      else after(0, callback);
    };
    const cleanup = () => {
      disposed = true;
      unsubscribe();
      timers.forEach((timer) => window.clearTimeout(timer));
      animations.forEach((animation) => animation.cancel());
    };

    // Movimento reduzido: o nome da abertura nem é exibido (CSS) e o h1 nunca é escondido;
    // a cortina só some num fade.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroPhase("done");
      whenFinished(play(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }), () => setMounted(false));
      return cleanup;
    }

    const nameEl = find("name");
    const reveal = find("reveal");
    const outline = find("outline");
    const caret = find("caret");
    const caretLine = find("caret-line");
    const counter = find("counter");
    if (!nameEl || !reveal || !outline || !caret || !caretLine || !counter) {
      setIntroPhase("done");
      after(0, () => setMounted(false));
      return cleanup;
    }

    let blink: Animation | null = null;

    // Varredura e saída são criadas juntas, cada uma com seu atraso: depois deste ponto nada
    // depende de a thread principal estar livre para o movimento continuar.
    const run = () => {
      // Medidas tomadas uma única vez, com a página parada no topo.
      const target = document.querySelector<HTMLElement>("[data-intro-target]");
      const from = nameEl.getBoundingClientRect();
      const to = target?.getBoundingClientRect();
      // Fora da home, ou com a página rolada até uma âncora, não há h1 na tela: o nome sai com a cortina.
      const landsOnHero = Boolean(to && to.top >= 0 && to.bottom <= window.innerHeight);
      const travel = reveal.getBoundingClientRect().width;
      const lineHeight = counter.getBoundingClientRect().height;

      blink?.cancel();

      // Varredura: a janela desliza para a direita e o contorno, dentro dela, desliza de volta na
      // mesma medida. O contorno fica parado na tela e o que aparece atrás é o nome preenchido.
      const sweep = { duration: SWEEP_MS };
      play(reveal, slideFrames(travel), sweep);
      play(outline, slideFrames(-travel), sweep);
      play(caret, slideFrames(travel), sweep);
      findAll("digit").forEach((digit, index) => play(digit, digitFrames(DIGIT_PLACES[index], lineHeight), sweep));

      // Saída: linhas até as bordas, cursor some, cortina abre na linha do nome.
      const seams = findAll("seam");
      seams.forEach((seam) => {
        play(seam, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
          delay: SEAM_AT_MS,
          duration: 450,
          easing: EASE_IN_OUT_CUBIC,
        });
        play(seam, [{ opacity: 1 }, { opacity: 0 }], { delay: OPEN_AT_MS + 200, duration: 350 });
      });
      play(caretLine, [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], {
        delay: SEAM_AT_MS + 120,
        duration: 300,
        easing: EASE_IN_CUBIC,
      });
      play(counter, [{ opacity: 1 }, { opacity: 0 }], { delay: SEAM_AT_MS + 200, duration: 200 });

      const opening = { delay: OPEN_AT_MS, duration: OPEN_MS, easing: EASE_IN_OUT_EXPO };
      const opened = play(find("panel-top"), [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], opening);
      play(find("panel-bottom"), [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }], opening);
      after(OPEN_AT_MS, () => setIntroPhase("revealing"));

      if (landsOnHero && to) {
        // O layout encaixa cada caixa no pixel físico mais próximo; o deslocamento precisa ser inteiro nessa
        // grade, senão o texto transladado fica meio pixel fora do h1 e a troca aparece.
        const snap = (value: number) => Math.round(value * window.devicePixelRatio) / window.devicePixelRatio;
        const x = snap(to.left) - snap(from.left);
        const y = snap(to.top) - snap(from.top);
        const landed = play(
          nameEl,
          [{ transform: "translate(0px, 0px)" }, { transform: `translate(${x}px, ${y}px)` }],
          opening
        );
        // O h1 aparece por baixo, já no lugar, e só então a cópia da abertura some: as duas renderizações
        // diferem em frações de pixel nas bordas, e a sobreposição esconde essa diferença.
        whenFinished(landed, () => {
          setIntroPhase("done");
          whenFinished(play(nameEl, [{ opacity: 1 }, { opacity: 0 }], { delay: 50, duration: 200 }), () =>
            setMounted(false)
          );
        });
      } else {
        // O nome sai por cima da máscara antes de a fresta abrir, para não cruzar o conteúdo da página.
        const letters = Array.from(nameEl.querySelectorAll<HTMLElement>('[data-intro="fill"] [data-intro="letter"]'));
        letters.forEach((letter, index) => {
          play(letter, [{ transform: "translateY(0)" }, { transform: "translateY(-130%)" }], {
            delay: SEAM_AT_MS + index * 12,
            duration: 450,
            easing: EASE_IN_CUBIC,
          });
        });
        whenFinished(opened, () => {
          setIntroPhase("done");
          setMounted(false);
        });
      }
    };

    // A varredura espera o site estar pronto: fontes carregadas e cena WebGL aquecida (shaders
    // compilados, modelos processados; ver `SceneWarmup`). Enquanto espera, o cursor pisca no início do nome.
    let fontsReady = false;
    let timedOut = false;
    let armed = false;
    let started = false;
    const tryStart = () => {
      if (disposed || started || !armed) return;
      if (!timedOut && !(fontsReady && useUIStore.getState().isSceneReady)) return;
      started = true;
      run();
    };

    document.fonts.ready.then(() => {
      fontsReady = true;
      tryStart();
    });
    unsubscribe = useUIStore.subscribe(tryStart);
    after(MAX_WAIT_MS, () => {
      timedOut = true;
      tryStart();
    });

    // As letras sobem por CSS desde o primeiro paint; aqui só se espera o começo delas.
    const riseTime = outline.querySelector('[data-intro="letter"]')?.getAnimations()[0]?.currentTime;
    after(typeof riseTime === "number" ? Math.max(0, SWEEP_START_MS - riseTime) : 0, () => {
      armed = true;
      play(caret, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      blink = play(
        caretLine,
        [
          { opacity: 1, easing: "step-end" },
          { opacity: 0, offset: 0.5, easing: "step-end" },
          { opacity: 0 },
        ],
        { delay: 350, duration: 900, iterations: Infinity, fill: "none" }
      );
      tryStart();
    });

    return cleanup;
  }, [setIntroPhase]);

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[60] overflow-hidden pointer-events-none">
      {/* Cortina em duas metades; a de cima sobrepõe 1px para não haver fresta em alturas ímpares. */}
      <div data-intro="panel-top" aria-hidden="true" className="absolute inset-x-0 top-0 h-[calc(50%+1px)] bg-background">
        <span className="absolute top-5 left-6 md:top-7 md:left-12 font-mono text-lg font-bold tracking-tight text-ink">
          &gt;<span className="text-foreground">_</span>
        </span>
      </div>
      <div data-intro="panel-bottom" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-background" />

      <div className="absolute inset-0 flex items-center gap-[3vw] motion-reduce:hidden">
        <span data-intro="seam" aria-hidden="true" className="h-px flex-1 origin-right bg-foreground" style={SEAM_CLOSED} />

        <div data-intro="name" className="relative font-serif text-hero font-medium leading-none uppercase whitespace-nowrap">
          {/* Nome preenchido: pintado desde o primeiro quadro (é o candidato a LCP), escondido pela camada de cima. */}
          <div data-intro="fill" aria-hidden="true" className="text-ink">
            <Letters text={name} />
          </div>
          {/* Janela de recorte com o contorno sobre fundo opaco. A sobra em volta cobre til, perna do J
              e serifas do nome preenchido. */}
          <div data-intro="reveal" aria-hidden="true" className="absolute -inset-y-[0.25em] -inset-x-[0.1em] overflow-hidden">
            <div data-intro="outline" className="h-full py-[0.25em] px-[0.1em] bg-background text-outline">
              <Letters text={name} rise />
            </div>
          </div>

          {/* Cursor de varredura: o `_` da marca. Leva o contador, que é o progressbar acessível. */}
          <div data-intro="caret" className="absolute inset-y-0 -inset-x-[0.1em] opacity-0">
            <span
              data-intro="caret-line"
              aria-hidden="true"
              className="absolute -inset-y-[0.14em] left-0 w-px md:w-0.5 bg-foreground shadow-glow-strong"
            />
            <span className="absolute top-full left-0 pt-[0.24em]">
              <span
                data-intro="counter"
                role="progressbar"
                aria-label={label}
                className="flex h-[1em] -translate-x-1/2 overflow-hidden font-mono text-xs font-normal leading-none tracking-[0.2em] tabular-nums text-foreground"
              >
                {DIGIT_PLACES.map((place) => (
                  <span key={place} data-intro="digit" aria-hidden="true" className="flex flex-col">
                    {DIGITS.map((digit) => (
                      <span key={digit} className="block h-[1em]">
                        {digit}
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            </span>
          </div>
        </div>

        <span data-intro="seam" aria-hidden="true" className="h-px flex-1 origin-left bg-foreground" style={SEAM_CLOSED} />
      </div>
    </div>
  );
}
