import Link from "next/link"

interface CategoryBadgeProps {
  category: {
    id: number
    name: string
    slug: string
    color: string
    createdAt?: string
    updatedAt?: string
    postCount?: number
  }
  showCount?: boolean
}

export default function CategoryBadge({ category, showCount = false }: CategoryBadgeProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors hover:opacity-80"
      style={{
        backgroundColor: category.color + "20",
        color: category.color,
        borderColor: category.color + "40",
        borderWidth: "1px",
      }}
    >
      {category.name}
      {showCount && category.postCount !== undefined && (
        <span className="ml-1 text-xs opacity-75">({category.postCount})</span>
      )}
    </Link>
  )
}
