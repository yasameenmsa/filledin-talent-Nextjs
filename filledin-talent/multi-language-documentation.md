# Multi-Language Support Documentation

This document outlines how to implement and manage multi-language support in the application.

## File Structure

The language-specific content is managed through a dynamic route in Next.js. The `[lang]` parameter in the `app/[lang]` directory captures the language code from the URL.

- `app/[lang]/layout.tsx`: The main layout file that wraps all pages and provides the language context.
- `app/[lang]/page.tsx`: The main page file for each language.
- `components/layout/Header.tsx`: The header component, which contains the language-specific text and the language switcher.
- `lib/i18n/`: This directory can be used to store more complex translation files if needed.

## How It Works

1.  **Dynamic Routing**: The `[lang]` parameter in the URL determines the language to be displayed. For example, `/en` for English, `/fr` for French, and `/ar` for Arabic.

2.  **Language Detection**: The `Header.tsx` component reads the `lang` parameter from the URL using the `usePathname` hook from `next/navigation`.

    ```javascript
    const pathname = usePathname();
    const currentLanguage = pathname?.split('/')[1] || 'en';
    ```

3.  **Language-Specific Text**: The `Header.tsx` component uses helper functions to get the correct text for the current language.

    - `getNavigationText(currentLanguage)`: Returns an object with the navigation link text.
    - `getUIText(currentLanguage)`: Returns an object with other UI text, such as button labels.

    ```javascript
    const navigationText = getNavigationText(currentLanguage);
    const uiText = getUIText(currentLanguage);
    ```

4.  **Language Switcher**: The language switcher is a dropdown menu in the header that links to the different language versions of the site.

    ```javascript
    <Link href="/en">English</Link>
    <Link href="/fr">Français</Link>
    <Link href="/ar">العربية</Link>
    ```

## Adding a New Language

To add a new language, you need to:

1.  **Update the Helper Functions**: Add a new `case` to the `switch` statements in `getNavigationText` and `getUIText` in `Header.tsx` with the translations for the new language.

2.  **Add a Link to the Language Switcher**: Add a new link to the language switcher dropdown in `Header.tsx`.

## Adding Language Support to Other Components

To add language support to other components, you can follow the same pattern as in `Header.tsx`:

1.  **Get the Current Language**: Use the `usePathname` hook to get the current language from the URL.

2.  **Create a Helper Function**: Create a helper function to return the correct text for the current language.

3.  **Use the Helper Function**: Use the helper function to display the correct text in your component.