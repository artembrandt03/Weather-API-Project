// safe fetch + formatting helpers
export const safeFetchJson = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
};

export const formatDateTime = (unixSeconds, locale = "en-CA") => {
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  });
};
