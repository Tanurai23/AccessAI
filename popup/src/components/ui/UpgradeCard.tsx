import * as React from "react"
import { Button } from "@/components/ui/button"
import { Crown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

// Direct import from your card folder (no circular)
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from "@/components/ui/UpgradeCard"

interface UpgradeCardProps {
  feature?: string
  className?: string
}

// ... rest of component stays identical ...

export const UpgradeCard = React.forwardRef<
  HTMLDivElement, 
  UpgradeCardProps
>(({ feature = "this feature", className, ...props }, ref) => {
  const handleUpgrade = () => {
    // Stripe checkout (replace with your endpoint)
    window.open("https://buy.stripe.com/test_...", "_blank")
  }

  return (
    <Card 
      ref={ref}
      className={cn(
        "border-2 border-orange-200 bg-gradient-to-br from-orange-50/80 to-yellow-50/80",
        "shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Crown className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-xl leading-tight text-foreground">
              Pro Required
            </h3>
            <p className="text-sm text-muted-foreground">
              Unlock {feature} instantly
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">Saved Scans</span>
              <span className="font-bold text-green-600">∞</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">PDF Reports</span>
              <span className="font-bold text-green-600">∞</span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• Priority support</div>
            <div>• Team dashboards</div>
            <div>• New AI features first</div>
          </div>
        </div>

        <div className="p-3 bg-orange-50/50 rounded-lg border border-dashed border-orange-200">
          <div className="flex items-center justify-between text-xs">
            <span>Pro: $9/month</span>
            <span className="font-semibold text-orange-700">Cancel anytime</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-6">
        <Button 
          onClick={handleUpgrade}
          className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 
                     hover:from-orange-600 hover:to-orange-700 
                     text-white font-semibold shadow-lg hover:shadow-xl
                     transition-all duration-200"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-3">
          14-day money back guarantee
        </p>
      </CardFooter>
    </Card>
  )
})

UpgradeCard.displayName = "UpgradeCard"