import Image from "next/image";
import Link from "next/link";
import { Landmark, Quote, Star, Truck } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About Us",
  description: "Discover the devotional story behind Shubharambh Murti Point, where premium murtis are selected with shraddha for homes, gifting, and auspicious beginnings.",
  path: "/about"
});

export default function AboutPage() {
  const stats = [
    { label: "100+ Premium Designs", icon: Landmark },
    { label: "Pan India Delivery", icon: Truck },
    { label: "5-Star Customer Satisfaction", icon: Star }
  ];

  return (
    <main className="bg-[#F8F6F2]">
      <section className="premium-container about-page-enter py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
          <article className="rounded-[24px] border border-[#C8A24D]/25 bg-white px-7 py-9 shadow-premium md:px-10 md:py-12 lg:px-12 lg:py-14">
            <Quote size={46} className="text-[#C8A24D]" aria-hidden="true" />
            <p className="section-kicker mt-7 text-[#C8A24D]">About Shubharambh</p>
            <h1 className="mt-3 font-serif text-5xl leading-tight text-[#6A1E2D] md:text-6xl">
              Our Story
            </h1>

            <div className="mt-7 space-y-5 text-base font-medium leading-8 text-ink/70 md:text-lg md:leading-9">
              <p>
                Shubharambh Murti Point began with a simple belief: every sacred idol should feel as meaningful as the prayer it receives.
              </p>
              <p>
                We curate premium Ganpati Bappa and devotional murtis for their expression, finish, presence, and ability to bring grace into homes, offices, gifting moments, and festive celebrations.
              </p>
              <p>
                From selection to secure packaging, every detail is handled with devotion, warmth, and a promise of trusted quality.
              </p>
            </div>

            <Link href="/collections" className="btn btn-primary mt-9 border-[#6A1E2D] bg-[#6A1E2D]">
              Explore Collection
            </Link>
          </article>

          <aside className="rounded-[24px] border border-[#C8A24D]/25 bg-white p-5 shadow-premium md:p-7 lg:p-8">
            <div className="rounded-[24px] bg-linear-to-br from-[#6A1E2D] via-[#8b3342] to-[#C8A24D] p-5 shadow-card md:p-7">
              <div className="about-image-card relative mx-auto grid min-h-[350px] max-w-[460px] place-items-center rounded-[24px] border border-[#C8A24D] bg-white p-7 shadow-premium md:min-h-[430px] md:p-9">
                <div className="relative h-[300px] w-full md:h-[370px]">
                  <Image
                    src="/assets/bappa5.png"
                    alt="Premium Ganpati Bappa murti at Shubharambh Murti Point"
                    fill
                    priority
                    quality={82}
                    sizes="(max-width: 1023px) 86vw, 36vw"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="px-1 pb-1 pt-8 text-center md:px-4 md:pt-9">
              <p className="text-xl tracking-[0.16em] text-[#C8A24D]" aria-label="Five star rating">★★★★★</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-[#6A1E2D] md:text-4xl">
                Trusted by Hundreds of Devotees
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-8 text-ink/68">
                Premium handcrafted murtis with secure packaging and fast delivery across India.
              </p>

              <div className="mt-7 grid gap-3 md:grid-cols-3">
                {stats.map(({ label, icon: Icon }) => (
                  <div key={label} className="rounded-[24px] border border-[#C8A24D]/25 bg-[#F8F6F2] px-4 py-5 shadow-card transition hover:-translate-y-1 hover:shadow-hover">
                    <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#6A1E2D] text-white">
                      <Icon size={19} aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-sm font-black leading-6 text-[#6A1E2D]">{label}</p>
                  </div>
                ))}
              </div>

              <Link href="/collections" className="btn btn-primary mt-8 rounded-full border-[#6A1E2D] bg-[#6A1E2D]">
                Browse Collection
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
