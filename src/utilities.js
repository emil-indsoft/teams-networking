const x = 10;
console.info("test");

export function debounce(fn, ms) {
  let timer;

  return function (e) {
    const context = this;
    const arg = arguments;

    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, arg);
    }, ms);
  };
}

export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}
/**
 *
 * @param {String|Element} el
 */
export function mask(el) {
  if (typeof el === "string") {
    el = $(el);
  }
  el && el.classList.add("loading-mask");
}

/**
 *
 * @param {String|Element} el
 */
export function unmask(el) {
  if (typeof el === "string") {
    el = $(el);
  }
  el && el.classList.remove("loading-mask");
}

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

(async () => {
  console.info("start sleeping..");
  await sleep(2000);
  console.warn("2. ready to do %o", "next job");
})();

export function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(([key, value]) => {
      if (key !== "id") {
        return value.toLowerCase().includes(search);
      }
    });
  });
}
