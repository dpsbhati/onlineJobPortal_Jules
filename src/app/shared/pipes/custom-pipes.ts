import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({ name: 'keyfromvalue' })
export class KeyFromValuePipe implements PipeTransform {
    transform(kvalue: any, Enum: any) {
        for (const [key, value] of Object.entries(Enum)) {
            if (value == kvalue) return key;
        }
        return "";
    }
}

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
    transform(value: string, args: any[]): string {
        const limit = args.length > 0 ? parseInt(args[0], 10) : 20;
        const trail = args.length > 1 ? args[1] : '...';
        return value.length > limit ? value.substring(0, limit) + trail : value;
    }
}


@Pipe({ name: 'sanitizer' })
export class SanitizeHtmlPipe implements PipeTransform {

    constructor(private _sanitizer: DomSanitizer) { }

    transform(value: string): SafeHtml {
        return this._sanitizer.bypassSecurityTrustResourceUrl(value);
    }
}