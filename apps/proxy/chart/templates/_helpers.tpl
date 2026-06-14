{{- define "plane-proxy.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "plane-proxy.fullname" -}}
{{- default (include "plane-proxy.name" .) .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "plane-proxy.labels" -}}
app.kubernetes.io/name: {{ include "plane-proxy.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end -}}

{{- define "plane-proxy.selectorLabels" -}}
app.kubernetes.io/name: {{ include "plane-proxy.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
