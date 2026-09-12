import { memo } from "react";
import {
  FiArrowUpRight,
  FiBarChart2,
  FiCheck,
  FiChevronRight,
  FiLayers,
  FiPlay,
  FiZap,
} from "react-icons/fi";

import { Avatar } from "@/ui/components/primitives/avatar";
import { Badge } from "@/ui/components/primitives/badge";
import { Button } from "@/ui/components/primitives/button";
import { Card } from "@/ui/components/primitives/card";
import { Stat } from "@/ui/components/primitives/stat";

const features = [
  {
    icon: FiZap,
    eyebrow: "Ritmo de trabalho",
    title: "Menos ruído. Mais movimento.",
    description:
      "Organize o que importa em um espaço que acompanha o seu ritmo e deixa cada decisão mais clara.",
    accent: "text-(--color-warning)",
  },
  {
    icon: FiLayers,
    eyebrow: "Tudo conectado",
    title: "Uma visão para cada camada.",
    description:
      "Do primeiro rascunho ao resultado final, mantenha contexto, pessoas e prioridades no mesmo lugar.",
    accent: "text-(--color-primary)",
  },
  {
    icon: FiBarChart2,
    eyebrow: "Clareza contínua",
    title: "Progresso que dá para sentir.",
    description:
      "Transforme sinais dispersos em uma leitura simples do que está avançando — e do próximo passo.",
    accent: "text-(--color-success)",
  },
];

const Home = memo(() => {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-(--color-bg)">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-80 [background-image:radial-gradient(circle_at_78%_8%,rgba(94,168,255,0.16),transparent_28%),radial-gradient(circle_at_8%_44%,rgba(126,87,194,0.10),transparent_26%)]" />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a
          href="#top"
          className="group inline-flex items-center gap-3"
          aria-label="Nexa início"
        >
          <span className="grid size-9 place-items-center rounded-xl border border-white/12 bg-white/6 text-(--color-primary) shadow-(--shadow-sm) transition-transform duration-300 group-hover:rotate-6">
            <FiZap aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-[0.18em] text-(--color-text)">
            NEXA
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-(--color-text-muted) md:flex">
          <a
            className="transition-colors hover:text-(--color-text)"
            href="#produto"
          >
            Produto
          </a>
          <a
            className="transition-colors hover:text-(--color-text)"
            href="#visao"
          >
            Visão
          </a>
          <a
            className="transition-colors hover:text-(--color-text)"
            href="#comece"
          >
            Comece agora
          </a>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          rightIcon={<FiArrowUpRight aria-hidden="true" />}
        >
          <a href="#comece">Entrar</a>
        </Button>
      </nav>

      <section
        id="top"
        className="relative z-10 mx-auto grid min-h-[calc(100dvh-88px)] w-full max-w-7xl items-center gap-16 px-6 pb-20 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-28 lg:pt-8"
      >
        <div className="max-w-2xl">
          <Badge variant="info" size="md" showIndicator>
            A próxima camada do seu trabalho
          </Badge>
          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.065em] text-(--color-text) sm:text-7xl lg:text-[6.5rem]">
            Clareza para criar o que vem{" "}
            <span className="text-(--color-primary)">depois.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
            Nexa é o espaço calmo entre a ideia e a entrega. Conecte times,
            decisões e progresso em uma experiência feita para dar impulso ao
            que realmente importa.
          </p>
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              rightIcon={<FiArrowUpRight aria-hidden="true" />}
            >
              <a href="#comece">Começar agora</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              leftIcon={<FiPlay aria-hidden="true" />}
            >
              <a href="#visao">Ver como funciona</a>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-4 border-t border-(--color-border) pt-6">
            <div className="flex -space-x-2">
              <Avatar
                fallback="MA"
                size="sm"
                alt="Marina Alves"
                className="border-2 border-(--color-bg)"
              />
              <Avatar
                fallback="RC"
                size="sm"
                alt="Rafael Costa"
                className="border-2 border-(--color-bg)"
              />
              <Avatar
                fallback="LS"
                size="sm"
                alt="Luiza Santos"
                className="border-2 border-(--color-bg)"
              />
            </div>
            <p className="text-xs leading-5 text-(--color-text-muted)">
              <span className="font-semibold text-(--color-text)">
                +2.000 criadores
              </span>
              <br />
              já encontraram seu próximo passo.
            </p>
          </div>
        </div>

        <div id="visao" className="relative mx-auto w-full max-w-lg lg:ml-auto">
          <div className="absolute -inset-8 rounded-full bg-(--color-primary-glow) opacity-30 blur-3xl" />
          <Card className="relative overflow-hidden border-white/12 bg-(--color-surface)/90 shadow-(--shadow-lg) backdrop-blur-xl">
            <Card.Header className="flex-row items-start justify-between border-b border-(--color-border) pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--color-text-muted)">
                  Painel de foco
                </p>
                <Card.Title className="mt-2 text-xl">
                  Semana em movimento
                </Card.Title>
              </div>
              <Badge variant="success" size="sm" showIndicator>
                Ao vivo
              </Badge>
            </Card.Header>
            <Card.Body className="space-y-6 pt-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-(--color-text-muted)">
                    Progresso geral
                  </p>
                  <p className="mt-1 text-5xl font-semibold tracking-[-0.06em] text-(--color-text)">
                    78
                    <span className="text-2xl text-(--color-text-muted)">
                      %
                    </span>
                  </p>
                </div>
                <span className="mb-2 text-sm font-medium text-(--color-success)">
                  +12.4%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-(--color-surface-3)">
                <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,var(--color-primary),#9b7cff)] shadow-[0_0_20px_var(--color-primary-glow)]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Stat
                  className="border-white/8 bg-(--color-surface-2)/70 p-3"
                  label="Entregas"
                  value="24"
                  trend="+8%"
                  trendDirection="up"
                />
                <Stat
                  className="border-white/8 bg-(--color-surface-2)/70 p-3"
                  label="Em foco"
                  value="08"
                  trend="Hoje"
                />
                <Stat
                  className="border-white/8 bg-(--color-surface-2)/70 p-3"
                  label="Impacto"
                  value="4.8x"
                  trend="+18%"
                  trendDirection="up"
                />
              </div>
            </Card.Body>
            <Card.Footer className="justify-between border-white/8 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <FiCheck
                  className="text-(--color-success)"
                  aria-hidden="true"
                />{" "}
                Última atualização agora
              </div>
              <a
                href="#produto"
                className="inline-flex items-center gap-1 text-xs font-medium text-(--color-primary) transition-colors hover:text-(--color-text)"
              >
                Detalhes <FiChevronRight aria-hidden="true" />
              </a>
            </Card.Footer>
          </Card>
          <div className="absolute -bottom-8 -left-8 hidden rounded-2xl border border-white/10 bg-(--color-surface-2)/90 p-4 shadow-(--shadow-md) backdrop-blur-md sm:block">
            <p className="text-xs text-(--color-text-muted)">
              Tempo recuperado
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-(--color-text)">
              6h 42m
            </p>
          </div>
        </div>
      </section>

      <section
        id="produto"
        className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-primary)">
              Feito para o ritmo real
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-(--color-text) sm:text-5xl">
              O simples fica poderoso quando tudo conversa.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-(--color-text-muted)">
            Uma base flexível para transformar intenção em avanço, sem esconder
            o que precisa da sua atenção.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(
            ({ icon: Icon, eyebrow, title, description, accent }) => (
              <Card
                key={title}
                className="group border-white/8 bg-(--color-surface)/70 p-2 transition-transform duration-300 hover:-translate-y-1 hover:border-white/16"
              >
                <Card.Body className="p-5 sm:p-6">
                  <Icon
                    className={`mb-10 text-2xl ${accent}`}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--color-text-muted)">
                    {eyebrow}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.03em] text-(--color-text)">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-(--color-text-muted)">
                    {description}
                  </p>
                  <a
                    href="#comece"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-(--color-text) transition-colors group-hover:text-(--color-primary)"
                  >
                    Explorar <FiArrowUpRight aria-hidden="true" />
                  </a>
                </Card.Body>
              </Card>
            ),
          )}
        </div>
      </section>

      <section
        id="comece"
        className="relative z-10 mx-6 mb-6 overflow-hidden rounded-(--radius-xl) border border-white/10 bg-(--color-surface-2) px-6 py-16 text-center sm:px-12 lg:mx-auto lg:max-w-7xl lg:py-24"
      >
        <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-(--color-primary-glow) opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-primary)">
            Seu próximo capítulo começa aqui
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-(--color-text) sm:text-6xl">
            Faça espaço para o que importa.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-(--color-text-muted) sm:text-base">
            Comece com uma visão mais limpa, reúna seu time e dê ao trabalho a
            clareza que ele merece.
          </p>
          <Button
            className="mt-9"
            asChild
            size="lg"
            rightIcon={<FiArrowUpRight aria-hidden="true" />}
          >
            <a href="mailto:hello@nexa.example">Quero conhecer a Nexa</a>
          </Button>
        </div>
      </section>
      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-(--color-text-muted) sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span>© 2025 Nexa. Feito para seguir em frente.</span>
        <span className="tracking-[0.12em]">CLAREZA / RITMO / IMPACTO</span>
      </footer>
    </main>
  );
});

Home.displayName = "Home";

export default Home;
