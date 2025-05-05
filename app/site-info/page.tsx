"use client"

import { useState } from "react"
import { useSiteSettings } from "@/lib/site-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function SiteInfoPage() {
  const { settings, loading } = useSiteSettings()
  const [activeTab, setActiveTab] = useState("about")

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-32 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {settings.logoUrl ? (
            <img src={settings.logoUrl || "/placeholder.svg"} alt={settings.siteName} className="h-16 w-auto" />
          ) : (
            <BookOpen className="h-16 w-16 text-primary" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{settings.siteName}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{settings.siteDescription}</p>
          </div>
        </div>

        <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="about">Бидний тухай</TabsTrigger>
            <TabsTrigger value="contact">Холбоо барих</TabsTrigger>
            <TabsTrigger value="social">Сошиал хаягууд</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Бидний тухай</CardTitle>
                <CardDescription>MarketingClass.mn платформын тухай</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Бидний эрхэм зорилго</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    MarketingClass.mn нь Монголын маркетингийн мэргэжилтнүүдийг дэмжих, тэдний ур чадварыг хөгжүүлэх,
                    мэргэжлийн өсөлтийг дэмжих зорилготой онлайн сургалтын платформ юм. Бид чанартай, хүртээмжтэй
                    сургалтуудаар дамжуулан маркетингийн салбарт шинэ стандартыг тогтоохыг зорьж байна.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Бидний үнэт зүйлс</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>
                      <span className="font-medium">Чанар</span> - Бид хамгийн чанартай, шинэлэг агуулгыг санал болгодог
                    </li>
                    <li>
                      <span className="font-medium">Хүртээмж</span> - Бидний сургалтууд хүн бүрт хүртээмжтэй
                    </li>
                    <li>
                      <span className="font-medium">Инноваци</span> - Бид маркетингийн салбарын хамгийн сүүлийн үеийн
                      чиг хандлагыг дагадаг
                    </li>
                    <li>
                      <span className="font-medium">Хамтын ажиллагаа</span> - Бид хэрэглэгчдийнхээ санал хүсэлтийг
                      үргэлж сонсдог
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Бидний түүх</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    MarketingClass.mn нь 2022 онд маркетингийн мэргэжилтнүүдийн баг хамт олноор үүсгэн байгуулагдсан.
                    Монголын зах зээл дээр чанартай маркетингийн сургалт дутагдалтай байгааг анзаарч, бид энэхүү
                    хэрэгцээг хангах зорилгоор платформоо хөгжүүлж эхэлсэн. Өнөөдрийн байдлаар бид 1000+ суралцагчид,
                    50+ сургалт, 20+ мэргэжлийн багш нартай хамтран ажиллаж байна.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Холбоо барих</CardTitle>
                <CardDescription>Бидэнтэй холбоо барих мэдээлэл</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-medium mb-2">Хаяг</h3>
                        <p className="text-gray-700 dark:text-gray-300">{settings.contactInfo.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-medium mb-2">Утасны дугаар</h3>
                        <p className="text-gray-700 dark:text-gray-300">{settings.contactInfo.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg md:col-span-2">
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-medium mb-2">И-мэйл хаяг</h3>
                        <p className="text-gray-700 dark:text-gray-300">{settings.contactInfo.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Байршил</h3>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.7631953491477!2d106.91716707674287!3d47.91886047121084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d96ed3ac0f79c75%3A0x7c2c99fe5c29095e!2sUlaanbaatar%2C%20Mongolia!5e0!3m2!1sen!2sus!4v1683123456789!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Сошиал хаягууд</CardTitle>
                <CardDescription>Бидний сошиал сүлжээний хаягууд</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.socialLinks.facebook && (
                    <a
                      href={settings.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Facebook className="h-6 w-6 text-blue-600 mr-3" />
                      <span className="flex-1">Facebook</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  )}

                  {settings.socialLinks.twitter && (
                    <a
                      href={settings.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Twitter className="h-6 w-6 text-sky-500 mr-3" />
                      <span className="flex-1">Twitter</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  )}

                  {settings.socialLinks.instagram && (
                    <a
                      href={settings.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Instagram className="h-6 w-6 text-pink-600 mr-3" />
                      <span className="flex-1">Instagram</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  )}

                  {settings.socialLinks.linkedin && (
                    <a
                      href={settings.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Linkedin className="h-6 w-6 text-blue-700 mr-3" />
                      <span className="flex-1">LinkedIn</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  )}
                </div>

                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Бидэнтэй холбогдоорой</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Бидний сошиал сүлжээний хаягуудаар дамжуулан та дараах боломжуудыг ашиглах боломжтой:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Хамгийн сүүлийн үеийн мэдээ, мэдээллийг авах</li>
                    <li>Тусгай урамшуулал, хөнгөлөлтийн талаар мэдээлэл авах</li>
                    <li>Шинэ сургалтуудын талаар хамгийн түрүүнд мэдэх</li>
                    <li>Маркетингийн салбарын сонирхолтой мэдээллүүдийг хүлээн авах</li>
                    <li>Бидэнтэй шууд холбогдох</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
