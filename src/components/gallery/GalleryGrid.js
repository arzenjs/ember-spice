"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GalleryGrid({ items, categories }) {
  const [filter, setFilter] = useState("all");
  const [index, setIndex] = useState(null);
  const dialogRef = useRef(null);

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const current = index !== null ? visible[index] : null;

  const open = (i) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = (d) => setIndex((i) => (i + d + visible.length) % visible.length);

  const chip = (active) =>
    cn(
      "min-h-11 rounded-full px-5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors",
      active ? "bg-terracotta text-ivory" : "bg-ember-charcoal text-sand hover:text-ivory"
    );

  return (
    <>
      <div role="group" aria-label="Filter photos" className="flex flex-wrap gap-3">
        <button type="button" aria-pressed={filter === "all"} className={chip(filter === "all")} onClick={() => setFilter("all")}>
          All
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" aria-pressed={filter === c.id} className={chip(filter === c.id)} onClick={() => setFilter(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`View larger: ${item.title}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-ember-charcoal text-left"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ember-black/85 via-transparent to-transparent" />
              <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                <span className="font-display text-xl">{item.title}</span>
                <Maximize2 size={18} aria-hidden="true" className="shrink-0 text-sand" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === dialogRef.current && close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto max-h-[94vh] w-[min(94vw,60rem)] overflow-hidden rounded-xl bg-ember-charcoal p-0 text-ivory backdrop:bg-black/80"
      >
        {current && (
          <div className="flex flex-col">
            <div className="relative h-[62vh] w-full bg-ember-black">
              <Image src={current.src} alt={current.alt} fill sizes="(min-width: 1024px) 960px, 94vw" className="object-cover" />
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <h2 className="font-display text-2xl">{current.title}</h2>
                <p className="text-sm text-sand">{current.caption}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember-black hover:bg-ember-black/60">
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next photo" onClick={() => step(1)} className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember-black hover:bg-ember-black/60">
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Close photo viewer" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-lg bg-terracotta">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}