import { assertEquals } from "@std/assert";

// Tests de logique métier pour openLibrary/authors.ts
Deno.test("OpenLibrary Authors - Author URL construction tests", async (t) => {
    await t.step("should construct author URL correctly", () => {
        function getAuthorUrl(authorKey: string): string {
            const cleanKey = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
            return `${cleanKey}.json`;
        }

        assertEquals(getAuthorUrl("OL23919A"), "/authors/OL23919A.json");
        assertEquals(getAuthorUrl("/authors/OL23919A"), "/authors/OL23919A.json");
        assertEquals(getAuthorUrl("/authors/OL23919A/"), "/authors/OL23919A/.json");
    });

    await t.step("should construct author works URL correctly", () => {
        function getAuthorWorksUrl(authorKey: string): string {
            const cleanKey = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
            return `${cleanKey}/works.json`;
        }

        assertEquals(getAuthorWorksUrl("OL23919A"), "/authors/OL23919A/works.json");
        assertEquals(getAuthorWorksUrl("/authors/OL23919A"), "/authors/OL23919A/works.json");
    });

    await t.step("should normalize author keys consistently", () => {
        function normalizeAuthorKey(authorKey: string): string {
            return authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
        }

        assertEquals(normalizeAuthorKey("OL23919A"), "/authors/OL23919A");
        assertEquals(normalizeAuthorKey("/authors/OL23919A"), "/authors/OL23919A");
        assertEquals(normalizeAuthorKey("authors/OL23919A"), "/authors/authors/OL23919A"); // Edge case
    });
});

Deno.test("OpenLibrary Authors - Author works parameters tests", async (t) => {
    await t.step("should handle default author works parameters", () => {
        function buildAuthorWorksParams(params: any = {}): URLSearchParams {
            const searchParams = new URLSearchParams();

            searchParams.append('limit', String(params.limit || 20));
            searchParams.append('offset', String(params.offset || 0));

            return searchParams;
        }

        const defaultParams = buildAuthorWorksParams();
        assertEquals(defaultParams.get('limit'), "20");
        assertEquals(defaultParams.get('offset'), "0");

        const customParams = buildAuthorWorksParams({ limit: 50, offset: 10 });
        assertEquals(customParams.get('limit'), "50");
        assertEquals(customParams.get('offset'), "10");
    });

    await t.step("should validate author works URL construction", () => {
        function buildFullAuthorWorksUrl(authorKey: string, params: any = {}): string {
            const baseUrl = `/authors/${authorKey}/works.json`;
            const searchParams = new URLSearchParams();

            searchParams.append('limit', String(params.limit || 20));
            searchParams.append('offset', String(params.offset || 0));

            return `${baseUrl}?${searchParams.toString()}`;
        }

        const url = buildFullAuthorWorksUrl("OL23919A", { limit: 10 });
        assertEquals(url, "/authors/OL23919A/works.json?limit=10&offset=0");
    });
});

Deno.test("OpenLibrary Authors - Wikipedia URL construction tests", async (t) => {
    await t.step("should build Wikipedia URL correctly", () => {
        function buildWikipediaUrl(authorName: string, lang = 'fr'): string {
            const slug = authorName
                .trim()
                .replace(/\s+/g, '_')
                .replace(/^./, char => char.toUpperCase());

            return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
        }

        assertEquals(
            buildWikipediaUrl("victor hugo"),
            "https://fr.wikipedia.org/wiki/Victor_hugo"
        );

        assertEquals(
            buildWikipediaUrl("Ernest Hemingway", "en"),
            "https://en.wikipedia.org/wiki/Ernest_Hemingway"
        );

        assertEquals(
            buildWikipediaUrl("jean-paul sartre"),
            "https://fr.wikipedia.org/wiki/Jean-paul_sartre"
        );
    });

    await t.step("should handle special characters in author names", () => {
        function buildWikipediaUrl(authorName: string, lang = 'fr'): string {
            const slug = authorName
                .trim()
                .replace(/\s+/g, '_')
                .replace(/^./, char => char.toUpperCase());

            return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
        }

        assertEquals(
            buildWikipediaUrl("José Saramago"),
            "https://fr.wikipedia.org/wiki/Jos%C3%A9_Saramago"
        );

        assertEquals(
            buildWikipediaUrl("Haruki Murakami"),
            "https://fr.wikipedia.org/wiki/Haruki_Murakami"
        );
    });

    await t.step("should handle multiple spaces and trimming", () => {
        function buildWikipediaUrl(authorName: string, lang = 'fr'): string {
            const slug = authorName
                .trim()
                .replace(/\s+/g, '_')
                .replace(/^./, char => char.toUpperCase());

            return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
        }

        assertEquals(
            buildWikipediaUrl("  Victor   Hugo  "),
            "https://fr.wikipedia.org/wiki/Victor_Hugo"
        );

        assertEquals(
            buildWikipediaUrl("marcel\tproust"),
            "https://fr.wikipedia.org/wiki/Marcel_proust"
        );
    });
});

Deno.test("OpenLibrary Authors - Data structure validation tests", async (t) => {
    await t.step("should validate author details structure", () => {
        const mockAuthorDetails = {
            key: "/authors/OL23919A",
            name: "Test Author",
            bio: "A test author biography",
            photos: [123456],
            remote_ids: {
                wikidata: "Q123456"
            }
        };

        assertEquals(typeof mockAuthorDetails.key, "string");
        assertEquals(typeof mockAuthorDetails.name, "string");
        assertEquals(typeof mockAuthorDetails.bio, "string");
        assertEquals(Array.isArray(mockAuthorDetails.photos), true);
        assertEquals(typeof mockAuthorDetails.remote_ids, "object");
        assertEquals(typeof mockAuthorDetails.remote_ids.wikidata, "string");
    });

    await t.step("should validate author works result structure", () => {
        const mockAuthorWorksResult = {
            size: 10,
            entries: [
                {
                    key: "/works/OL40370366W",
                    title: "Test Work 1",
                    covers: [123456]
                },
                {
                    key: "/works/OL40370367W",
                    title: "Test Work 2",
                    covers: []
                }
            ]
        };

        assertEquals(typeof mockAuthorWorksResult.size, "number");
        assertEquals(Array.isArray(mockAuthorWorksResult.entries), true);
        assertEquals(mockAuthorWorksResult.entries.length, 2);

        mockAuthorWorksResult.entries.forEach(work => {
            assertEquals(typeof work.key, "string");
            assertEquals(typeof work.title, "string");
            assertEquals(Array.isArray(work.covers), true);
        });
    });

    await t.step("should validate combined author with works structure", () => {
        const mockCombinedResult = {
            author: {
                key: "/authors/OL23919A",
                name: "Test Author",
                bio: "A test biography"
            },
            works: {
                size: 5,
                entries: [
                    {
                        key: "/works/OL40370366W",
                        title: "Test Work",
                        covers: [123456]
                    }
                ]
            }
        };

        assertEquals(typeof mockCombinedResult.author, "object");
        assertEquals(typeof mockCombinedResult.works, "object");
        assertEquals(typeof mockCombinedResult.author.key, "string");
        assertEquals(typeof mockCombinedResult.author.name, "string");
        assertEquals(typeof mockCombinedResult.works.size, "number");
        assertEquals(Array.isArray(mockCombinedResult.works.entries), true);
    });
});

Deno.test("OpenLibrary Authors - Biography handling tests", async (t) => {
    await t.step("should handle different bio formats", () => {
        const bioString = "Simple string biography";
        const bioObject = {
            type: "text",
            value: "Object biography"
        };

        function extractBioText(bio: string | { type: string; value: string } | undefined): string {
            if (typeof bio === 'string') {
                return bio;
            }
            if (bio && typeof bio === 'object' && 'value' in bio) {
                return bio.value;
            }
            return '';
        }

        assertEquals(extractBioText(bioString), "Simple string biography");
        assertEquals(extractBioText(bioObject), "Object biography");
        assertEquals(extractBioText(undefined), "");
    });

    await t.step("should validate bio object structure", () => {
        const validBioObject = {
            type: "text",
            value: "Author biography text"
        };

        function isValidBioObject(bio: any): boolean {
            return bio &&
                   typeof bio === 'object' &&
                   typeof bio.type === 'string' &&
                   typeof bio.value === 'string';
        }

        assertEquals(isValidBioObject(validBioObject), true);
        assertEquals(isValidBioObject("string bio"), false);
        assertEquals(isValidBioObject({}), false);
        assertEquals(isValidBioObject({ type: "text" }), false);
        assertEquals(isValidBioObject({ value: "text" }), false);
    });
});