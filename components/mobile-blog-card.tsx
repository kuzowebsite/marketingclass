"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BlogPost } from "@/lib/types"

interface MobileBlogCardProps {
  post: BlogPost
  compact?: boolean
}

export function MobileBlogCard({ post, compact = false }: MobileBlogCardProps) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-md relative h-full", compact ? "shadow-sm" : "")}>
      <Link href={`/blog/${post.id || ""}`} className="block h-full">
        <div className="relative h-32 overflow-hidden">
          <img
            src={
              post.coverImage ||
              `/placeholder.svg?height=150&width=300&query=${encodeURIComponent(post.title + " blog") || "/placeholder.svg"}`
            }
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {post.featured && <Badge className="absolute top-2 left-2 bg-primary">Онцлох</Badge>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{post.author}</span>
            </div>
          </div>

          <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {!compact && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>}

          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center text-xs text-primary font-medium">
            <span>Дэлгэрэнгүй</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
