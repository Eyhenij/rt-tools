import { CMS_LABELS_EN } from './cms-labels.en';

/** A label key of the CMS client. The list is derived from the English set, the default itself. */
export type TCmsLabelKey = keyof typeof CMS_LABELS_EN;

/** Substitutions into places like `{{name}}`. */
export type TCmsLabelParams = Readonly<Record<string, string | number>>;

/**
 * How the package gets a label. The application gives it: only it knows the product language. The
 * function returns a ready string; an empty one counts as no answer, and the English default is
 * taken instead.
 */
export type TCmsTranslator = (key: TCmsLabelKey, params?: TCmsLabelParams) => string;

/** All labels at once, key to ready string. Labels with substitutions are taken one by one. */
export type TCmsLabelMap = Readonly<Record<TCmsLabelKey, string>>;
