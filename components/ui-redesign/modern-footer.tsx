"use client"

import Link from "next/link"
import { BookOpen, Mail, MapPin, Phone } from "lucide-react"
import { useSiteSettings } from "@/lib/site-settings"

export function ModernFooter() {
  const currentYear = new Date().getFullYear()
  const { settings, loading } = useSiteSettings()

  // Make sure we have default values for all properties we're accessing
  const contactInfo = settings?.contactInfo || {
    address: "Улаанбаатар, Чингэлтэй дүүрэг",
    phone: "+976 9911-2233",
    email: "info@marketingclass.mn",
  }

  const socialLinks = settings?.socialLinks || {
    facebook: "https://facebook.com/marketingclass.mn",
    twitter: "https://twitter.com/marketingclass_mn",
    instagram: "https://instagram.com/marketingclass.mn",
    linkedin: "https://linkedin.com/company/marketingclass-mn",
    youtube: "https://youtube.com/c/marketingclassmn",
  }

  const navigation = settings?.navigation || {
    home: "Нүүр",
    courses: "Хичээлүүд",
    organizations: "Байгууллага",
    individual: "Хувь хүн",
    blog: "Блог",
    leaderboard: "Шилдэг сурагчагчид",
    about: "Бидний тухай",
  }

  const footer = settings?.footer || {
    quickLinks: "Түсламж",
    resources: "Нэмэлт",
    contactUs: "Холбоо барих",
    allRightsReserved: "Бүх эрх хуулиар хамгаалагдсан.",
  }

  const siteName = settings?.siteName || "MarketingClass.mn"
  const siteDescription = settings?.siteDescription || "Онлайн маркетингийн мэргэжилтэн болох курс нээгдлээ"
  const logoUrl = settings?.logoUrl || ""

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            {loading ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </div>
                <div className="h-16 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="flex space-x-4">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  {logoUrl ? (
                    <img
                      src={logoUrl || "/placeholder.svg"}
                      alt={siteName}
                      className="h-8 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/abstract-logo.png"
                        e.currentTarget.onerror = null
                      }}
                    />
                  ) : (
                    <BookOpen className="h-8 w-8 text-primary" />
                  )}
                  <span className="text-xl font-bold tracking-tight">{siteName}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">{siteDescription}</p>
                <div className="flex space-x-4">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      aria-label="Facebook"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      aria-label="Twitter"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      aria-label="Instagram"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      aria-label="LinkedIn"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      aria-label="YouTube"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              {footer.quickLinks || "Түсламж"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  {navigation.courses || "Хичээлүүд"}
                </Link>
              </li>
              <li>
                <Link
                  href="/organization"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  {navigation.organizations || "Байгууллага"}
                </Link>
              </li>
              <li>
                <Link
                  href="/individual"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  {navigation.individual || "Хувь хүн"}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  {navigation.blog || "Блог"}
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  {navigation.leaderboard || "Шилдэг сурагчагчид"}
                </Link>
              </li>
              <li>
                <Link
                  href="/site-info"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  {navigation.about || "Бидний тухай"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              {footer.resources || "Нэмэлт"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Тусламжийн төв
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Үйлчилгээний нөхцөл
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Нууцлалын бодлого
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Түгээмэл асуултууд
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Багш болох
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              {footer.contactUs || "Холбоо барих"}
            </h3>
            {loading ? (
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mr-3 mt-0.5"></div>
                  <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </li>
                <li className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mr-3"></div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </li>
                <li className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mr-3"></div>
                  <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </li>
              </ul>
            ) : (
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.address}</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            © {currentYear} {siteName}. {footer.allRightsReserved || "Бүх эрх хуулиар хамгаалагдсан."}
          </p>
        </div>
      </div>
    </footer>
  )
}
