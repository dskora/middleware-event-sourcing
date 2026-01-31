import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { buildApi } from '../../api/apiBuilder';
import { buildLambdas } from '../../lambdas';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'middleware-api', {
      restApiName: `middleware-api-${props.env}`,
    });

    const lambdas = buildLambdas(this);

    buildApi(api, lambdas);
  }
}
