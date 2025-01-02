import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from "@angular/core";
import { JwtInterceptor } from "./jwt.interceptor";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AuthService } from "../services/auth.service";

export const provideAuth = (): Array<Provider | EnvironmentProviders> =>
    {
        return [
            provideHttpClient(withInterceptors([JwtInterceptor])),
            {
                provide : ENVIRONMENT_INITIALIZER,
                useValue: () => inject(AuthService),
                multi   : true,
            },
        ];
    };