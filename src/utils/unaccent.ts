const unaccent = (text: string): string =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default unaccent;