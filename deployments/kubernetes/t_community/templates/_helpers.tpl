
{{- define "plane.podScheduling" -}}
  {{- with .nodeSelector }} 
      nodeSelector: {{ toYaml . | nindent 8 }}
  {{- end }}
  {{- with .tolerations }}
      tolerations: {{ toYaml . | nindent 8 }}
  {{- end }}
  {{- with .affinity }}
      affinity: {{ toYaml . | nindent 8 }}
  {{- end }}
{{- end }}

{{- define "plane.labelsAndAnnotations" -}}
  {{- with .labels }}
  labels: {{ toYaml . | nindent 4 }}
  {{- end }}
  {{- with .annotations }}
  annotations: {{ toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
