// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { browserDetector, Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { detectResourcesSync } from '@opentelemetry/resources/build/src/detect-resources';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { sdk } from '@embraceio/embrace-web-sdk';

const SAMPLE_APP_ID = 'iwbcp';
const {
  NEXT_PUBLIC_OTEL_SERVICE_NAME = '',
  NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
  IS_SYNTHETIC_REQUEST = '',
} = typeof window !== 'undefined' ? window.ENV : {};

const FrontendTracer = (collectorString: string) => {
  let resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
  });

  const detectedResources = detectResourcesSync({ detectors: [browserDetector] });
  resource = resource.merge(detectedResources);
  const spanProcessor = new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || collectorString || 'http://localhost:4318/v1/traces',
    }),
    {
      scheduledDelayMillis: 500,
    }
  );

  const contextManager = new ZoneContextManager();

  const propagator = new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
  });

  sdk.initSDK({
    resource: resource,
    appID: SAMPLE_APP_ID,
    contextManager,
    propagator,
    spanProcessors: [spanProcessor],
    instrumentations: getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-fetch': {
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: true,
        applyCustomAttributesOnSpan(span) {
          span.setAttribute('app.synthetic_request', IS_SYNTHETIC_REQUEST);
        },
      },
    }),
  });
};

export default FrontendTracer;
