import {CHARACTERS} from './characters.data';

describe('Archive roster integrity', () => {
  it('includes all requested characters exactly once, with separate Masky and Hoodie', () => {
    const ids = CHARACTERS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ['bloody-painter', 'masky', 'hoodie', 'kate-the-chaser', 'ticci-toby', 'x-virus', 'eyeless-jack', 'slender-man', 'homicidal-liu', 'clockwork', 'lulu', 'zalgo', 'nurse-ann', 'judge-angel', 'the-puppeteer', 'lazari', 'sally-williams', 'ben-drowned', 'zero', 'jason-the-toymaker', 'nemesis', 'kagekao', 'jeff-the-killer', 'nina-the-killer', 'skully', 'the-observer', 'splendorman', 'offenderman', 'hobo-heart', 'suicide-sadie', 'laughing-jill', 'laughing-jack', 'candy-pop', 'candy-cane', 'lifeless-lucy', 'nightmare-ally', 'smile-dog']) {
      expect(ids.filter(found => found === id).length, id).toBe(1);
      expect(CHARACTERS.find(c => c.id === id)?.signature, id).toBeDefined();
    }
    expect(ids).not.toContain('masky-hoodie');
  });

  it('keeps all dossier connections valid after splitting the combined file', () => {
    const ids = new Set(CHARACTERS.map(c => c.id));
    for (const character of CHARACTERS) for (const id of character.connectedIds) expect(ids.has(id), `${character.id} → ${id}`).toBe(true);
  });
});
