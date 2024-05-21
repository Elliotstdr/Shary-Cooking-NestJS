import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { List } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ParseJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req?.body?.content) {
      req.body.content = JSON.stringify(req.body.content);
    }

    if (req?.body?.selectedRecipes) {
      req.body.selectedRecipes = JSON.stringify(req.body.selectedRecipes);
    }

    return next.handle().pipe(
      map((data: List | List[]) => {
        if (!Array.isArray(data)) {
          return parseObject(data);
        } else {
          data.map((x) => {
            return parseObject(x);
          });

          return data;
        }
      }),
    );
  }
}

function parseObject(object: List) {
  if (object?.content && typeof object.content === 'string') {
    object.content = JSON.parse(object.content);
  }

  if (object?.selectedRecipes && typeof object.selectedRecipes === 'string') {
    object.selectedRecipes = JSON.parse(object.selectedRecipes);
  }

  return object;
}
