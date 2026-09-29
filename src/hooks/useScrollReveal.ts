import { useEffect } from 'react';

/**
 * Hook to automatically observe and reveal elements with the '.scroll-reveal' class
 * as they enter the viewport during scrolling.
 */
export function useScrollReveal(triggerDependency?: any) {
  useEffect(() => {
    // If user prefers reduced motion, immediately mark all as revealed
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      }
    );

    // Initial query
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => {
      // If already in top viewport, reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });

    // Handle dynamically rendered elements
    const mutationObserver = new MutationObserver(() => {
      const newElements = document.querySelectorAll('.scroll-reveal:not(.revealed)');
      newElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('revealed');
        } else {
          observer.observe(el);
        }
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [triggerDependency]);
}
