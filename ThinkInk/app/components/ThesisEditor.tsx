import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface ThesisEditorProps {
  thesisText: string
  setThesisText: (text: string) => void
  activeAssignment: number
  markComplete: () => void
}

export function ThesisEditor({
  thesisText,
  setThesisText,
  activeAssignment,
  markComplete
}: ThesisEditorProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Your Thesis</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={thesisText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setThesisText(e.target.value)}
            placeholder="Write your thesis statement here..."
            className="min-h-[200px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )
} 