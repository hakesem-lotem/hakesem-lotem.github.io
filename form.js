// הקסם של לוטם — שליחת טופס כהודעת וואטסאפ. שום מידע לא נשמר בשרת.
const WA_NUMBER = "972587013148";

function fmtDate(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v;
}

function valueOf(q) {
  const parts = [];
  const checked = [...q.querySelectorAll(".chips input:checked")].map(i => i.value);
  if (checked.length) parts.push(checked.join(", "));
  q.querySelectorAll("input[type=text], input[type=tel], input[type=date], input[type=time], input[type=number], textarea")
    .forEach(el => {
      let v = el.value.trim();
      if (!v) return;
      if (el.type === "date") v = fmtDate(v);
      const pre = el.dataset.prefix ? el.dataset.prefix + " " : "";
      parts.push(pre + v);
    });
  return parts.join(" — ");
}

function serialize(form) {
  const out = [`*${form.dataset.title}*`, ""];
  form.querySelectorAll("section.card").forEach(sec => {
    const lines = [];
    const walk = (root, indent) => {
      root.querySelectorAll(":scope > .q, :scope > .pair > .q, :scope > .children > .child, :scope > .child").forEach(node => {
        if (node.classList.contains("child")) {
          const sub = [];
          let name = "";
          node.querySelectorAll(".q").forEach(q => {
            const v = valueOf(q);
            if (!v) return;
            if (q.dataset.label === "שם") { name = v; return; }
            sub.push(`   ${q.dataset.label}: ${v}`);
          });
          if (name || sub.length) lines.push(`• ${name || node.querySelector(".child-h b").textContent}`, ...sub);
        } else {
          const v = valueOf(node);
          if (v) lines.push(`${node.dataset.label}: ${v}`);
        }
      });
    };
    walk(sec, "");
    if (lines.length) out.push(`*${sec.dataset.title}*`, ...lines, "");
  });
  return out.join("\n").trim();
}

function validate(form) {
  let ok = true;
  form.querySelectorAll("[required]").forEach(el => {
    const bad = !el.value.trim();
    el.classList.toggle("invalid", bad);
    if (bad && ok) { el.focus(); el.scrollIntoView({ block: "center", behavior: "smooth" }); }
    if (bad) ok = false;
  });
  return ok;
}

function renumber(list) {
  list.querySelectorAll(".child").forEach((c, i) => {
    c.querySelector(".child-h b").textContent = `ילד/ה ${i + 1}`;
    c.querySelector(".rm").hidden = i === 0;
  });
}

function setupChildren(form) {
  const list = form.querySelector(".children");
  const tpl = form.querySelector("#child-template");
  if (!list || !tpl) return;
  const add = () => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    const n = list.children.length;
    node.querySelectorAll("input[name]").forEach(i => { i.name = i.name + "_" + n; });
    node.querySelector(".rm").addEventListener("click", () => { node.remove(); renumber(list); });
    list.appendChild(node);
    renumber(list);
  };
  add();
  form.querySelector(".add").addEventListener("click", add);
}

document.querySelectorAll("form.wa").forEach(form => {
  setupChildren(form);
  form.addEventListener("input", e => e.target.classList.remove("invalid"));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const err = form.querySelector(".error");
    if (!validate(form)) { err.textContent = "חסרים כמה פרטים שמסומנים בכוכבית"; return; }
    err.textContent = "";
    const text = serialize(form);
    window.__lastMessage = text;
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  });
});
