interface PropertyDescriptionProps {
  description: string
  tags?: string[]
}

export function PropertyDescription({ description, tags }: PropertyDescriptionProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-cinza-900">Descrição</h2>
      <div className="space-y-4 leading-relaxed text-cinza-600">
        {description.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {tags && tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cinza-50 px-3 py-1 text-xs font-medium text-cinza-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
