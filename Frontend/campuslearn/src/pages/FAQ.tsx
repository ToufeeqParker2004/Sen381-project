import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const FAQ = () => {
  const faqCategories = [
    {
      category: "Getting Started",
      color: "bg-blue-500",
      faqs: [
        {
          question: "How do I access my courses?",
          answer: "Navigate to the 'Courses / Tutors' section in the sidebar to view all your enrolled courses and available tutors."
        },
        {
          question: "How do I book a tutoring session?",
          answer: "Go to the 'Courses / Tutors' page, find your desired tutor, and click on their profile to view available time slots and book a session."
        },
        {
          question: "Where can I find my study materials?",
          answer: "All your study materials and resources are available in the 'Resources' section. You can filter by subject or type of material."
        }
      ]
    },
    {
      category: "Technical Support",
      color: "bg-green-500",
      faqs: [
        {
          question: "I can't access my account, what should I do?",
          answer: "If you're having trouble logging in, please contact your campus IT support or use the 'Contact Support' option in your profile settings."
        },
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your registered email address."
        },
        {
          question: "The platform is running slowly, how can I fix this?",
          answer: "Try clearing your browser cache, ensure you have a stable internet connection, or try accessing the platform from a different browser."
        }
      ]
    },
    {
      category: "AI Tutor",
      color: "bg-purple-500",
      faqs: [
        {
          question: "What is the AI Tutor feature?",
          answer: "The AI Tutor is your personal learning assistant that can help answer questions, provide explanations, and guide you through complex topics 24/7."
        },
        {
          question: "How do I use the AI chatbot on resource pages?",
          answer: "When viewing any learning resource, you'll see a small chat icon at the bottom of the page. Click on it to ask questions about the specific content you're studying."
        },
        {
          question: "Can the AI Tutor help with assignments?",
          answer: "The AI Tutor can provide guidance, explanations, and help you understand concepts, but it cannot complete assignments for you. It's designed to support your learning process."
        }
      ]
    },
    {
      category: "Communication",
      color: "bg-orange-500",
      faqs: [
        {
          question: "How do I message other students?",
          answer: "Use the 'Messages' section to send direct messages to classmates or join the 'Forum' for group discussions on various topics."
        },
        {
          question: "Can I create study groups?",
          answer: "Yes! Use the 'Forum' section to create or join study groups. You can also coordinate through the 'Messages' feature."
        },
        {
          question: "How do I get notifications about new messages?",
          answer: "Check your profile settings to enable email notifications and browser notifications for new messages and forum updates."
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about using the CampusLearn platform.</p>
      </div>

      <div className="grid gap-6">
        {faqCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="shadow-custom-md">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <CardTitle className="text-xl">{category.category}</CardTitle>
              </div>
              <CardDescription>
                {category.faqs.length} questions in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">Still need help?</h3>
            <p className="text-muted-foreground">
              If you can't find the answer you're looking for, don't hesitate to reach out to our support team.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">📧 support@campus.edu</Badge>
              <Badge variant="secondary">📞 +27 (0) 11 123-4567</Badge>
              <Badge variant="secondary">💬 Live Chat Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;