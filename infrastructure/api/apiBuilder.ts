import { routes } from './routes';
import { LambdaIntegration, AuthorizationType, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { SpecRestApi } from "aws-cdk-lib/aws-apigateway/lib/restapi";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export function buildApi(
  api: SpecRestApi,
  lambdas: Record<string, IFunction>,
) {
  routes.forEach(route => {
    const resource = api.root.resourceForPath(route.path);

    resource.addMethod(
      route.method,
      new LambdaIntegration(lambdas[route.handler]),
    );
  });
}
