import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customMarkup'
})
export class CustomMarkupPipe implements PipeTransform {
    transform(value: string): string {

        if (!value) {
            return ''; // Or any default value you prefer
        }

        //support for next line
        value = value.replace(/\n/g, "<br>");

        // Support for bold text enclosed in double asterisks
        value = value.replace(/\*{2}([^*]+)\*{2}/g, '<b>$1</b>');

        // Support for italic text enclosed in underscores
        value = value.replace(/_([^_]+)_/g, '<i>$1</i>');

        // Support for underlined text enclosed in tildes
        value = value.replace(/~([^~]+)~/g, '<u>$1</u>');

        // Support for hyperlinks enclosed in square brackets
        value = value.replace(/\[([^[\]]+)\]\(([^()]+)\)/g, '<a href="$2">$1</a>');

        return value;
    }
}
